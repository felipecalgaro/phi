import { redis } from "./redis";

interface WebhookLogContext {
  eventId: string;
  eventType: string;
  uid?: string;
  action: "success" | "skipped" | "error_retryable" | "error_non_retryable";
  reason?: string;
  error?: string;
  timestamp: string;
}

interface WebhookError {
  name: string;
  message: string;
}

type WebhookClaimResult =
  | "already_processed"
  | "already_processing"
  | "claimed";

export function isRetryableError(error: WebhookError): boolean {
  const retryablePatterns = [
    /timeout/i,
    /rate.?limit/i,
    /connection/i,
    /unavailable/i,
    /econnrefused/i,
    /econnreset/i,
    /idempotency key/i,
    /email delivery failed/i,
  ];

  return retryablePatterns.some((pattern) =>
    pattern.test(error.name + error.message),
  );
}

export async function checkWebhookIdempotency(
  eventId: string,
): Promise<boolean> {
  const key = `stripe:webhook:${eventId}`;

  try {
    const exists = await redis.exists(key);
    return exists > 0;
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    throw new Error(`Idempotency check failed: ${err.message}`);
  }
}

export async function claimWebhookProcessing(
  eventId: string,
): Promise<WebhookClaimResult> {
  const processedKey = `stripe:webhook:${eventId}`;
  const processingKey = `stripe:webhook:processing:${eventId}`;

  try {
    const processedExists = await redis.exists(processedKey);

    if (processedExists > 0) {
      return "already_processed";
    }

    const lockResult = await redis.set(processingKey, "1", {
      nx: true,
      ex: 120,
    });

    if (lockResult === "OK") {
      return "claimed";
    }

    const wasProcessedAfterLockFail = await redis.exists(processedKey);
    return wasProcessedAfterLockFail > 0
      ? "already_processed"
      : "already_processing";
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    throw new Error(`Failed to claim webhook processing: ${err.message}`);
  }
}

export async function markWebhookProcessed(eventId: string): Promise<void> {
  const processedKey = `stripe:webhook:${eventId}`;
  const processingKey = `stripe:webhook:processing:${eventId}`;

  try {
    await Promise.all([
      redis.setex(processedKey, 604800, "processed"),
      redis.del(processingKey),
    ]);
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    throw new Error(
      `Failed to persist webhook idempotency key: ${err.message}`,
    );
  }
}

export async function releaseWebhookProcessing(eventId: string): Promise<void> {
  const processingKey = `stripe:webhook:processing:${eventId}`;

  try {
    await redis.del(processingKey);
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    throw new Error(
      `Failed to release webhook processing lock: ${err.message}`,
    );
  }
}

export function logWebhookEvent(context: WebhookLogContext): void {
  const logData = {
    eventId: context.eventId,
    eventType: context.eventType,
    uid: context.uid || "unknown",
    action: context.action,
    timestamp: context.timestamp,
    ...(context.reason && { reason: context.reason }),
    ...(context.error && { error: context.error }),
  };

  if (context.action === "success" || context.action === "skipped") {
    console.log("Stripe webhook processed:", logData);
  } else {
    console.error("Stripe webhook error:", logData);
  }
}
