"use server";

import { applyRateLimiter } from "@/utils/apply-rate-limiter";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import * as Sentry from "@sentry/nextjs";
import { verifySession } from "@/lib/dal";
import {
  setRateLimitContext,
  setRequestId,
  setUserId,
} from "@/lib/sentry-context";

export async function logoutUser() {
  const requestId = crypto.randomUUID();
  setRequestId(requestId);

  const { isAuthenticated, userId } = await verifySession();

  if (isAuthenticated) {
    setUserId(userId);
    setRateLimitContext("user", userId);
  } else {
    setRateLimitContext("ip");
  }

  const { success } = await applyRateLimiter({
    failureMode: "fail-closed",
  });

  if (!success) {
    Sentry.setTag("error_type", "rate_limit");
    Sentry.captureMessage("logout_rate_limited", { level: "warning" });

    return {
      success: false,
      error: "Too many requests, please try again later.",
    };
  }

  (await cookies()).delete("token");

  redirect("/acing-aufnahmetest");
}
