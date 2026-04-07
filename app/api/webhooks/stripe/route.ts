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
import * as Sentry from "@sentry/nextjs";
import { captureCriticalPathError } from "@/lib/sentry-errors";
import {
  setRequestId,
  setStripeEventId,
  setUserId,
} from "@/lib/sentry-context";

export async function POST(req: NextRequest) {
  const requestId = req.headers.get("x-request-id") ?? crypto.randomUUID();
  setRequestId(requestId);

  let event: Stripe.Event;
  const timestamp = new Date().toISOString();

  try {
    event = stripe.webhooks.constructEvent(
      await req.text(),
      req.headers.get("stripe-signature") as string,
      env.STRIPE_WEBHOOK_SECRET,
    );
  } catch (error) {
    captureCriticalPathError({
      error,
      path: "stripe_webhook",
      requestId,
      tags: {
        error_type: "signature_invalid",
      },
    });

    return NextResponse.json<ResponseDataObject>(
      {
        success: false,
        error: "Error while verifying signature",
      },
      { status: 400 },
    );
  }

  setStripeEventId(event.id);
  Sentry.setTag("event_type", event.type);

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
          Sentry.captureMessage("webhook_already_processing", {
            level: "warning",
          });

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

        if (checkoutSession.metadata?.userId) {
          setUserId(checkoutSession.metadata.userId);
        }

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

        Sentry.setTag(
          "fulfillment_result",
          fulfillmentResult.roleUpdated ? "granted" : "already_paid",
        );

        if (fulfillmentResult.roleUpdated) {
          Sentry.captureMessage("webhook_processed", { level: "info" });
        }

        return new Response(null, { status: 200 });
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));
        const isRetryable = isRetryableError(err);
        const statusCode = isRetryable ? 500 : 200;

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

        captureCriticalPathError({
          error: err,
          path: "stripe_webhook",
          requestId,
          tags: {
            event_type: event.type,
            retryable: String(isRetryable),
          },
          extra: {
            stripeEventId: event.id,
          },
        });

        try {
          if (isRetryable) {
            await releaseWebhookProcessing(event.id);
          } else {
            await markWebhookProcessed(event.id);
          }
        } catch (lockReleaseError) {
          console.error("Failed to update webhook processing state:", {
            error:
              lockReleaseError instanceof Error
                ? lockReleaseError.message
                : String(lockReleaseError),
            eventId: event.id,
          });
        }

        return new Response(null, { status: statusCode });
      }
    }

    default:
      return new Response(null, { status: 200 });
  }
}
