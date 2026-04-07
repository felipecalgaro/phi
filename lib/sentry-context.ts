import * as Sentry from "@sentry/nextjs";

export type RateLimitKeyType = "user" | "ip" | "email";

export function setUserId(userId: string) {
  Sentry.setUser({ id: userId });
  Sentry.setTag("user_id", userId);
}

export function setStripeEventId(stripeEventId: string) {
  Sentry.setTag("stripe_event_id", stripeEventId);
  Sentry.setContext("stripe", {
    eventId: stripeEventId,
  });
}

export function setLessonSlug(lessonSlug: string) {
  Sentry.setTag("lesson_slug", lessonSlug);
  Sentry.setContext("lesson", {
    slug: lessonSlug,
  });
}

export function setRateLimitContext(
  keyType: RateLimitKeyType,
  bucketHash?: string,
) {
  Sentry.setTag("rate_limit_key_type", keyType);
  Sentry.setContext("rate_limit", {
    keyType,
    bucketHash: bucketHash ?? "unknown",
  });
}

export function setRequestId(requestId: string) {
  Sentry.setTag("request_id", requestId);
  Sentry.setContext("request", {
    requestId,
  });
}
