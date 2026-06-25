"use server";

import * as Sentry from "@sentry/nextjs";
import { z } from "zod";
import { verifySession } from "@/lib/dal";
import {
  roadmapAnswersSchema,
  saveRoadmapAnswersForUser,
} from "@/lib/roadmap-generation";
import { captureCriticalPathError } from "@/lib/sentry-errors";
import {
  setRateLimitContext,
  setRequestId,
  setUserId,
} from "@/lib/sentry-context";
import { applyRateLimiter } from "@/utils/apply-rate-limiter";
import { ResponseDataObject } from "@/utils/get-response-data-object";
import { redirect } from "next/navigation";

const requestSchema = z.object({
  answers: roadmapAnswersSchema,
});

export async function generateRoadmap(
  request: unknown,
): Promise<ResponseDataObject> {
  const requestId = crypto.randomUUID();
  setRequestId(requestId);

  const requestData = requestSchema.safeParse(request);

  if (!requestData.success) {
    Sentry.setTag("error_type", "invalid_payload");

    return {
      success: false,
      error: "Invalid request data. Please try again.",
    };
  }

  const { isAuthenticated, userId } = await verifySession();

  if (!isAuthenticated) {
    Sentry.setTag("error_type", "unauthenticated");

    return {
      success: false,
      error: "Unauthorized. Please log in and try again.",
    };
  }

  setUserId(userId);
  setRateLimitContext("user", userId);

  const { success } = await applyRateLimiter({
    failureMode: "fail-closed",
    userId,
  });

  if (!success) {
    Sentry.setTag("error_type", "rate_limit");
    Sentry.captureMessage("generate_roadmap_rate_limited", {
      level: "warning",
    });

    return {
      success: false,
      error: "Too many requests, please try again later.",
    };
  }

  try {
    await saveRoadmapAnswersForUser({
      userId,
      answers: requestData.data.answers,
    });
  } catch (error) {
    captureCriticalPathError({
      error,
      path: "generate_roadmap",
      requestId,
      tags: {
        flow: "authenticated",
      },
    });

    return {
      success: false,
      error: "Error generating roadmap. Please try again later.",
    };
  }

  redirect("/roadmap");
}
