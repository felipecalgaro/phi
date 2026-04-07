import * as Sentry from "@sentry/nextjs";

export type SentryErrorType =
  | "rate_limit"
  | "invalid_token"
  | "replay_detected"
  | "signature_invalid"
  | "provider_error"
  | "database_error"
  | "forbidden"
  | "not_found"
  | "unknown";

export interface SentryErrorClassification {
  type: SentryErrorType;
  retryable: boolean;
  severity: Sentry.SeverityLevel;
}

export interface CaptureCriticalPathErrorOptions {
  error: unknown;
  path: string;
  requestId?: string;
  tags?: Record<string, string>;
  extra?: Record<string, string | number | boolean | null | undefined>;
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  return String(error);
}

export function classifyError(error: unknown): SentryErrorClassification {
  const message = getErrorMessage(error).toLowerCase();

  if (message.includes("rate limit") || message.includes("too many requests")) {
    return {
      type: "rate_limit",
      retryable: true,
      severity: "warning",
    };
  }

  if (message.includes("invalid token")) {
    return {
      type: "invalid_token",
      retryable: false,
      severity: "warning",
    };
  }

  if (
    message.includes("already consumed") ||
    message.includes("replay") ||
    message.includes("concurrent")
  ) {
    return {
      type: "replay_detected",
      retryable: false,
      severity: "warning",
    };
  }

  if (message.includes("signature") || message.includes("webhook")) {
    return {
      type: "signature_invalid",
      retryable: false,
      severity: "warning",
    };
  }

  if (
    message.includes("cloudfront") ||
    message.includes("resend") ||
    message.includes("stripe") ||
    message.includes("provider")
  ) {
    return {
      type: "provider_error",
      retryable: true,
      severity: "error",
    };
  }

  if (message.includes("database") || message.includes("prisma")) {
    return {
      type: "database_error",
      retryable: true,
      severity: "fatal",
    };
  }

  if (message.includes("forbidden") || message.includes("unauthorized")) {
    return {
      type: "forbidden",
      retryable: false,
      severity: "warning",
    };
  }

  if (message.includes("not found")) {
    return {
      type: "not_found",
      retryable: false,
      severity: "warning",
    };
  }

  return {
    type: "unknown",
    retryable: true,
    severity: "error",
  };
}

export function captureCriticalPathError({
  error,
  path,
  requestId,
  tags,
  extra,
}: CaptureCriticalPathErrorOptions) {
  const classification = classifyError(error);

  Sentry.setTag("critical_path", path);
  Sentry.setTag("error_type", classification.type);

  if (requestId) {
    Sentry.setTag("request_id", requestId);
  }

  if (tags) {
    for (const [key, value] of Object.entries(tags)) {
      Sentry.setTag(key, value);
    }
  }

  if (extra) {
    Sentry.setContext("critical_path_error", extra);
  }

  return Sentry.captureException(error);
}
