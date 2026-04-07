import { applyRateLimiter } from "@/utils/apply-rate-limiter";
import z from "zod";
import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { createCookiesSession } from "@/utils/create-cookies-session";
import { Role } from "@/generated/prisma/enums";
import { ResponseDataObject } from "@/utils/get-response-data-object";
import { Stripe } from "stripe";
import { cookies } from "next/headers";
import { verifySession } from "@/lib/dal";
import { verifyCheckoutSessionPrice } from "@/lib/fulfillment";
import * as Sentry from "@sentry/nextjs";
import { captureCriticalPathError } from "@/lib/sentry-errors";
import {
  setRateLimitContext,
  setRequestId,
  setStripeEventId,
  setUserId,
} from "@/lib/sentry-context";

const checkoutSessionMetadataSchema = z.object({
  userId: z.uuid(),
});

const queryParamsSchema = z.object({
  sessionId: z.string(),
  stripeEventId: z.string().optional(),
});

export async function POST(request: NextRequest) {
  const requestId = request.headers.get("x-request-id") ?? crypto.randomUUID();
  setRequestId(requestId);

  const { isAuthenticated, userId: authenticatedUserId } =
    await verifySession();

  if (!isAuthenticated) {
    Sentry.setTag("error_type", "unauthenticated");

    return NextResponse.json<ResponseDataObject>(
      {
        success: false,
        error: "Unauthenticated",
      },
      { status: 401 },
    );
  }

  setUserId(authenticatedUserId);
  setRateLimitContext("user", authenticatedUserId);

  const { success } = await applyRateLimiter({
    failureMode: "fail-closed",
    userId: authenticatedUserId,
  });

  if (!success) {
    Sentry.setTag("error_type", "rate_limit");
    Sentry.captureMessage("fulfill_rate_limited", { level: "warning" });

    return NextResponse.json<ResponseDataObject>(
      {
        success: false,
        error: "Too many requests, please try again later.",
      },
      { status: 429 },
    );
  }

  let sessionId: string;
  let stripeEventId: string | undefined;
  try {
    const body = await request.json();
    const result = queryParamsSchema.parse(body);
    sessionId = result.sessionId;
    stripeEventId = result.stripeEventId;

    if (stripeEventId) {
      setStripeEventId(stripeEventId);
    }
  } catch (error) {
    captureCriticalPathError({
      error,
      path: "fulfill_premium_session",
      requestId,
    });

    return NextResponse.json<ResponseDataObject>(
      {
        success: false,
        error: "Invalid request body",
      },
      { status: 400 },
    );
  }

  let checkoutSession: Stripe.Checkout.Session;
  try {
    checkoutSession = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["line_items"],
    });
  } catch (error) {
    captureCriticalPathError({
      error,
      path: "fulfill_premium_session",
      requestId,
      tags: {
        error_type: "provider_error",
      },
    });

    return NextResponse.json<ResponseDataObject>(
      {
        success: false,
        error: "Error retrieving checkout session",
      },
      { status: 502 },
    );
  }

  if (checkoutSession.payment_status === "paid") {
    verifyCheckoutSessionPrice(checkoutSession);

    const result = checkoutSessionMetadataSchema.safeParse(
      checkoutSession.metadata,
    );

    if (!result.success) {
      Sentry.setTag("error_type", "invalid_metadata");

      return NextResponse.json<ResponseDataObject>(
        {
          success: false,
          error: "Invalid checkout session metadata",
        },
        { status: 422 },
      );
    }

    const { userId } = result.data;

    if (stripeEventId) {
      setStripeEventId(stripeEventId);
    }

    if (userId !== authenticatedUserId) {
      Sentry.setTag("error_type", "forbidden");

      return NextResponse.json<ResponseDataObject>(
        {
          success: false,
          error: "Unauthorized",
        },
        { status: 403 },
      );
    }

    await createCookiesSession({
      userId,
      userRole: Role.PREMIUM,
    });

    Sentry.setTag("fulfillment_result", "granted");
    Sentry.captureMessage("entitlement_granted", { level: "info" });

    return NextResponse.json<ResponseDataObject>({
      success: true,
      data: null,
    });
  } else {
    (await cookies()).delete("token");
    Sentry.setTag("error_type", "payment_not_completed");

    return NextResponse.json<ResponseDataObject>(
      {
        success: false,
        error: "Payment not completed",
      },
      { status: 402 },
    );
  }
}
