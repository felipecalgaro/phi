import { createCookiesSession } from "@/utils/create-cookies-session";
import { env } from "@/lib/env";
import { stripe } from "@/lib/stripe";
import { redirect } from "next/navigation";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { ResponseDataObject } from "@/utils/get-response-data-object";
import { verifySession } from "@/lib/dal";
import {
  claimWebhookProcessing,
  isRetryableError,
  logWebhookEvent,
  markWebhookProcessed,
  releaseWebhookProcessing,
} from "@/lib/webhook-utils";
import {
  fulfillPremiumAccess,
  sendPurchaseConfirmationEmail,
} from "@/lib/fulfillment";

const checkoutSessionMetadataSchema = z.object({
  userId: z.uuid(),
});

// Verify that the checkout session includes the expected product price
function verifyCheckoutSessionPrice(
  checkoutSession: Stripe.Checkout.Session,
): void {
  if (
    !checkoutSession.line_items ||
    checkoutSession.line_items.data.length === 0
  ) {
    throw new Error("No items in checkout session");
  }

  const hasExpectedPrice = checkoutSession.line_items.data.some(
    (item) => item.price?.id === env.STRIPE_PRICE_ID,
  );

  if (!hasExpectedPrice) {
    throw new Error("Unexpected product in checkout session");
  }
}

async function processStripeCheckout(
  checkoutSession: Stripe.Checkout.Session,
  options?: { verifyPrice?: boolean; sendEmail?: boolean },
): Promise<{ userEmail?: string } | void> {
  const result = checkoutSessionMetadataSchema.safeParse(
    checkoutSession.metadata,
  );

  if (!result.success) {
    throw new Error("Invalid metadata in checkout session");
  }

  const { userId } = result.data;

  if (checkoutSession.payment_status !== "paid") {
    throw new Error("Payment was not completed successfully");
  }

  if (options?.verifyPrice) {
    verifyCheckoutSessionPrice(checkoutSession);
  }

  try {
    const user = await prisma.user.findUniqueOrThrow({
      where: { id: userId },
      select: { role: true, email: true },
    });

    if (user.role === "PREMIUM") {
      return;
    }

    await Promise.all([
      prisma.user.update({
        where: {
          id: userId,
        },
        data: {
          role: "PREMIUM",
        },
      }),
      createCookiesSession({
        userId,
        userRole: "PREMIUM",
      }),
    ]);

    if (options?.sendEmail) {
      return { userEmail: user.email };
    }
  } catch {
    throw new Error("Failed to purchase course");
  }
}

export async function GET(req: NextRequest) {
  const sessionId = req.nextUrl.searchParams.get("session_id");

  if (!sessionId) {
    redirect("/acing-aufnahmetest/purchase/error");
  }

  let redirectUrl: string;
  try {
    const { isAuthenticated, userId: authenticatedUserId } =
      await verifySession();

    if (!isAuthenticated) {
      throw new Error("User is not authenticated");
    }

    const checkoutSession = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["line_items"],
    });

    const metadataResult = checkoutSessionMetadataSchema.safeParse(
      checkoutSession.metadata,
    );
    if (!metadataResult.success) {
      throw new Error("Invalid metadata in checkout session");
    }

    if (metadataResult.data.userId !== authenticatedUserId) {
      throw new Error("Checkout session does not belong to authenticated user");
    }

    const checkoutResult = await processStripeCheckout(checkoutSession, {
      verifyPrice: true,
      sendEmail: true,
    });

    if (checkoutResult?.userEmail) {
      try {
        await sendPurchaseConfirmationEmail(checkoutResult.userEmail);
      } catch (error) {
        console.error("Failed to send purchase confirmation email on GET:", {
          error: error instanceof Error ? error.message : String(error),
          sessionId,
        });
      }
    }

    redirectUrl = "/acing-aufnahmetest/purchase/success";
  } catch {
    redirectUrl = "/acing-aufnahmetest/purchase/error";
  }

  return NextResponse.redirect(new URL(redirectUrl, req.url));
}

export async function POST(req: NextRequest) {
  let event: Stripe.Event;
  const timestamp = new Date().toISOString();

  try {
    event = stripe.webhooks.constructEvent(
      await req.text(),
      req.headers.get("stripe-signature") as string,
      env.STRIPE_WEBHOOK_SECRET,
    );
  } catch {
    return NextResponse.json<ResponseDataObject>(
      {
        success: false,
        error: "Error while verifying signature",
      },
      { status: 400 },
    );
  }

  switch (event.type) {
    case "checkout.session.completed":
    case "checkout.session.async_payment_succeeded": {
      const rawCheckoutSession = event.data.object as Stripe.Checkout.Session;

      try {
        const claimResult = await claimWebhookProcessing(event.id);

        if (claimResult === "already_processed") {
          logWebhookEvent({
            eventId: event.id,
            eventType: event.type,
            action: "skipped",
            reason: "Already processed (idempotency key exists)",
            timestamp,
          });
          return new Response(null, { status: 200 });
        }

        if (claimResult === "already_processing") {
          logWebhookEvent({
            eventId: event.id,
            eventType: event.type,
            action: "error_retryable",
            reason: "Another worker is processing this event; retrying",
            timestamp,
          });
          return new Response(null, { status: 500 });
        }

        if (!rawCheckoutSession.id) {
          throw new Error("Missing checkout session id in webhook payload");
        }

        const checkoutSession = await stripe.checkout.sessions.retrieve(
          rawCheckoutSession.id,
          {
            expand: ["line_items"],
          },
        );

        const fulfillmentResult = await fulfillPremiumAccess(
          checkoutSession,
          true,
        );

        if (fulfillmentResult.userEmail) {
          try {
            await sendPurchaseConfirmationEmail(fulfillmentResult.userEmail);
          } catch (emailError) {
            const err =
              emailError instanceof Error
                ? emailError
                : new Error(String(emailError));

            throw new Error(
              `Purchase confirmation email delivery failed: ${err.message}`,
            );
          }
        }

        logWebhookEvent({
          eventId: event.id,
          eventType: event.type,
          uid: (checkoutSession.metadata?.userId as string) || "unknown",
          action: "success",
          reason: fulfillmentResult.roleUpdated
            ? "Role granted"
            : "Already premium",
          timestamp,
        });

        await markWebhookProcessed(event.id);

        return new Response(null, { status: 200 });
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));
        const isRetryable = isRetryableError(err);
        const statusCode = isRetryable ? 500 : 200;

        try {
          await releaseWebhookProcessing(event.id);
        } catch (lockReleaseError) {
          console.error("Failed to release webhook processing lock:", {
            error:
              lockReleaseError instanceof Error
                ? lockReleaseError.message
                : String(lockReleaseError),
            eventId: event.id,
          });
        }

        logWebhookEvent({
          eventId: event.id,
          eventType: event.type,
          uid: (rawCheckoutSession.metadata?.userId as string) || "unknown",
          action: isRetryable ? "error_retryable" : "error_non_retryable",
          error: err.message,
          reason: isRetryable
            ? "Will retry per Stripe policy"
            : "Stored as non-retryable; manual review required",
          timestamp,
        });

        return new Response(null, { status: statusCode });
      }
    }

    default:
      return new Response(null, { status: 200 });
  }
}
