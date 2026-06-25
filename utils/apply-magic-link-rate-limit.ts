import "server-only";

import * as Sentry from "@sentry/nextjs";
import { emailRateLimiter, rateLimiter } from "@/lib/rate-limiters";
import { captureCriticalPathError } from "@/lib/sentry-errors";
import { setRateLimitContext } from "@/lib/sentry-context";
import { getUserIp } from "@/utils/get-user-ip";

type ApplyMagicLinkRateLimitOptions = {
  email: string;
  path: string;
  requestId: string;
};

type MagicLinkRateLimitResult =
  | {
      success: true;
    }
  | {
      success: false;
      error: string;
    };

export async function applyMagicLinkRateLimit({
  email,
  path,
  requestId,
}: ApplyMagicLinkRateLimitOptions): Promise<MagicLinkRateLimitResult> {
  const ip = await getUserIp();

  const checks = [
    {
      keyType: "email" as const,
      key: `email:${email}`,
      limit: function () {
        return emailRateLimiter.limit(this.key);
      },
    },
    {
      keyType: "ip" as const,
      key: `ip:${ip ?? "unknown"}`,
      limit: function () {
        return rateLimiter.limit(this.key);
      },
    },
  ];

  for (const check of checks) {
    setRateLimitContext(check.keyType, check.key);

    try {
      const { success } = await check.limit();

      if (!success) {
        Sentry.setTag("error_type", "rate_limit");
        Sentry.captureMessage("magic_link_rate_limited", {
          level: "warning",
        });

        return {
          success: false,
          error: "Too many requests, please try again later.",
        };
      }
    } catch (error) {
      captureCriticalPathError({
        error,
        path,
        requestId,
        tags: {
          rate_limit_key_type: check.keyType,
        },
      });

      console.error("Rate limiter check failed", {
        rateLimitKey: check.key,
        errorMessage: error instanceof Error ? error.message : "unknown_error",
      });

      return {
        success: false,
        error: "Error processing request. Please try again later.",
      };
    }
  }

  return {
    success: true,
  };
}
