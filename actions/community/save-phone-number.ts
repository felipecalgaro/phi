"use server";

import * as Sentry from "@sentry/nextjs";
import { Prisma } from "@/generated/prisma/client";
import { verifySession } from "@/lib/dal";
import prisma from "@/lib/prisma";
import { captureCriticalPathError } from "@/lib/sentry-errors";
import {
  setRateLimitContext,
  setRequestId,
  setUserId,
} from "@/lib/sentry-context";
import { applyRateLimiter } from "@/utils/apply-rate-limiter";
import { ResponseDataObject } from "@/utils/get-response-data-object";
import { z } from "zod";

const requestSchema = z.object({
  phoneNumber: z.string().trim().min(1, "Enter your phone number."),
});

export async function savePhoneNumber(
  request: unknown,
): Promise<ResponseDataObject<{ phoneNumber: string }>> {
  const requestId = crypto.randomUUID();
  setRequestId(requestId);

  const parsedRequest = requestSchema.safeParse(request);

  if (!parsedRequest.success) {
    Sentry.setTag("error_type", "invalid_payload");

    return {
      success: false,
      error: "Invalid request data. Please try again.",
    };
  }

  const { isAuthenticated, userId } = await verifySession();

  if (!isAuthenticated) {
    Sentry.setTag("error_type", "forbidden");

    return {
      success: false,
      error: "Unauthorized. Please log in and try again.",
    };
  }

  setUserId(userId);
  setRateLimitContext("user", userId);

  const { success: rateLimitSuccess } = await applyRateLimiter({
    failureMode: "fail-closed",
    userId,
  });

  if (!rateLimitSuccess) {
    Sentry.setTag("error_type", "rate_limit");
    Sentry.captureMessage("save_phone_number_rate_limited", {
      level: "warning",
    });

    return {
      success: false,
      error: "Too many requests, please try again later.",
    };
  }

  try {
    await prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        phoneNumber: parsedRequest.data.phoneNumber,
      },
    });

    return {
      success: true,
      data: {
        phoneNumber: parsedRequest.data.phoneNumber,
      },
    };
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      Sentry.setTag("error_type", "phone_conflict");

      return {
        success: false,
        error: "This phone number is already linked to another account.",
      };
    }

    captureCriticalPathError({
      error,
      path: "save_phone_number",
      requestId,
      tags: {
        error_type: "database_error",
      },
    });

    return {
      success: false,
      error: "Error processing request. Please try again later.",
    };
  }
}
