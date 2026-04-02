import { applyRateLimiterBasedOnIP } from "@/utils/apply-rate-limiter-based-on-ip";
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

const checkoutSessionMetadataSchema = z.object({
  userId: z.uuid(),
});

const queryParamsSchema = z.object({
  sessionId: z.string(),
});

export async function POST(request: NextRequest) {
  const { success } = await applyRateLimiterBasedOnIP();

  if (!success) {
    return NextResponse.json<ResponseDataObject>({
      success: false,
      error: "Too many requests, please try again later.",
    });
  }

  const { isAuthenticated, userId: authenticatedUserId } =
    await verifySession();

  if (!isAuthenticated) {
    return NextResponse.json<ResponseDataObject>({
      success: false,
      error: "User not authenticated",
    });
  }

  let sessionId: string;
  try {
    const body = await request.json();
    const result = queryParamsSchema.parse(body);
    sessionId = result.sessionId;
  } catch {
    return NextResponse.json<ResponseDataObject>({
      success: false,
      error: "Invalid request body",
    });
  }

  let checkoutSession: Stripe.Checkout.Session;
  try {
    checkoutSession = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["line_items"],
    });
  } catch {
    return NextResponse.json<ResponseDataObject>({
      success: false,
      error: "Error retrieving checkout session",
    });
  }

  if (checkoutSession.payment_status === "paid") {
    verifyCheckoutSessionPrice(checkoutSession);

    const result = checkoutSessionMetadataSchema.safeParse(
      checkoutSession.metadata,
    );

    if (!result.success) {
      return NextResponse.json<ResponseDataObject>({
        success: false,
        error: "Invalid checkout session metadata",
      });
    }

    const { userId } = result.data;

    if (userId !== authenticatedUserId) {
      return NextResponse.json<ResponseDataObject>({
        success: false,
        error: "User not authorized",
      });
    }

    await createCookiesSession({
      userId,
      userRole: Role.PREMIUM,
    });

    return NextResponse.json<ResponseDataObject>({
      success: true,
      data: null,
    });
  } else {
    (await cookies()).delete("token");

    return NextResponse.json<ResponseDataObject>({
      success: false,
      error: "Payment not completed",
    });
  }
}
