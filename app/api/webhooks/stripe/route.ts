import { env } from "@/lib/env";
import { stripe } from "@/lib/stripe";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { ResponseDataObject } from "@/utils/get-response-data-object";
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

export async function POST(req: NextRequest) {
  console.log("object");
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
