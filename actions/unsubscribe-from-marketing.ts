"use server";

import * as Sentry from "@sentry/nextjs";
import { Prisma } from "@/generated/prisma/client";
import { verifyMarketingUnsubscribeToken } from "@/lib/marketing-unsubscribe";
import prisma from "@/lib/prisma";
import { captureCriticalPathError } from "@/lib/sentry-errors";
import {
  setRateLimitContext,
  setRequestId,
  setUserId,
} from "@/lib/sentry-context";
import { applyRateLimiter } from "@/utils/apply-rate-limiter";
import { redirect } from "next/navigation";
import { z } from "zod";

const requestSchema = z
  .instanceof(FormData)
  .transform(function (formData) {
    return {
      token: formData.get("token"),
    };
  })
  .pipe(
    z.object({
      token: z.string().trim().min(1),
    }),
  );

export async function unsubscribeFromMarketing(request: unknown) {
  const requestId = crypto.randomUUID();
  setRequestId(requestId);

  const parsedRequest = requestSchema.safeParse(request);

  if (!parsedRequest.success) {
    Sentry.setTag("error_type", "invalid_payload");

    redirect("/unsubscribe?status=invalid");
  }

  setRateLimitContext("ip");

  const { success: rateLimitSuccess } = await applyRateLimiter({
    failureMode: "fail-closed",
  });

  if (!rateLimitSuccess) {
    Sentry.setTag("error_type", "rate_limit");
    Sentry.captureMessage("marketing_unsubscribe_rate_limited", {
      level: "warning",
    });

    redirect("/unsubscribe?status=rate-limited");
  }

  const tokenData = await verifyMarketingUnsubscribeToken(
    parsedRequest.data.token,
  ).catch(function () {
    Sentry.setTag("error_type", "invalid_token");
    Sentry.captureMessage("marketing_unsubscribe_invalid_token", {
      level: "warning",
    });

    return null;
  });

  if (!tokenData) {
    redirect("/unsubscribe?status=invalid");
  }

  setUserId(tokenData.userId);
  setRateLimitContext("email", tokenData.email);

  try {
    await prisma.user.update({
      where: {
        id: tokenData.userId,
        email: tokenData.email,
      },
      data: {
        subscribedToMarketing: false,
      },
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      Sentry.setTag("error_type", "not_found");

      redirect("/unsubscribe?status=invalid");
    }

    captureCriticalPathError({
      error,
      path: "unsubscribe_from_marketing",
      requestId,
      tags: {
        error_type: "database_error",
      },
    });

    redirect("/unsubscribe?status=error");
  }

  redirect("/unsubscribe?status=success");
}
