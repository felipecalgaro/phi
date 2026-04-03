import { rateLimiter } from "@/lib/rate-limiters";
import { getUserIp } from "./get-user-ip";
import "server-only";

type ApplyRateLimiterOptions = {
  failureMode?: "fail-open" | "fail-closed";
  userId?: string;
  email?: string;
};

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export async function applyRateLimiter({
  failureMode = "fail-open",
  userId,
  email,
}: ApplyRateLimiterOptions = {}) {
  const ip = await getUserIp();
  const normalizedEmail = email ? normalizeEmail(email) : null;

  const rateLimitKey = userId
    ? `user:${userId}:ip:${ip ?? "unknown"}`
    : normalizedEmail
      ? `email:${normalizedEmail}:ip:${ip ?? "unknown"}`
      : `ip:${ip ?? "unknown"}`;

  try {
    const { success } = await rateLimiter.limit(rateLimitKey);

    return { success };
  } catch (error) {
    console.error("Rate limiter check failed", {
      failureMode,
      rateLimitKey,
      errorMessage: error instanceof Error ? error.message : "unknown_error",
    });

    return { success: failureMode === "fail-open" };
  }
}
