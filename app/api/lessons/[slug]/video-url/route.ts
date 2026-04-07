import { verifySession } from "@/lib/dal";
import prisma from "@/lib/prisma";
import { applyRateLimiter } from "@/utils/apply-rate-limiter";
import { getSignedLessonVideoUrl } from "@/utils/get-signed-lesson-video-url";
import { ResponseDataObject } from "@/utils/get-response-data-object";
import { NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";
import { captureCriticalPathError } from "@/lib/sentry-errors";
import {
  setLessonSlug,
  setRateLimitContext,
  setRequestId,
} from "@/lib/sentry-context";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const requestId = request.headers.get("x-request-id") ?? crypto.randomUUID();
  setRequestId(requestId);
  setRateLimitContext("ip");

  const { success } = await applyRateLimiter({
    failureMode: "fail-open",
  });

  if (!success) {
    Sentry.setTag("error_type", "rate_limit");

    return NextResponse.json<ResponseDataObject>(
      {
        success: false,
        error: "Too many requests, please try again later.",
      },
      { status: 429 },
    );
  }

  const { isAuthenticated, userRole } = await verifySession();

  if (!isAuthenticated) {
    return NextResponse.json<ResponseDataObject>(
      {
        success: false,
        error: "Unauthenticated",
      },
      { status: 401 },
    );
  }

  if (userRole === "BASIC") {
    return NextResponse.json<ResponseDataObject>(
      {
        success: false,
        error: "Subscription required",
      },
      { status: 403 },
    );
  }

  const { slug } = await params;
  setLessonSlug(slug);

  try {
    const lesson = await prisma.lesson.findUnique({ where: { slug } });

    if (!lesson) {
      Sentry.setTag("error_type", "not_found");
      Sentry.captureMessage("lesson_not_found", { level: "warning" });

      return NextResponse.json<ResponseDataObject>(
        {
          success: false,
          error: "Lesson not found",
        },
        { status: 404 },
      );
    }

    const signedVideoUrl = getSignedLessonVideoUrl(slug);

    const response = NextResponse.json<ResponseDataObject>(
      {
        success: true,
        data: signedVideoUrl,
      },
      { status: 200 },
    );

    response.headers.set("Cache-Control", "private, no-store");

    return response;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    const lowerMessage = message.toLowerCase();

    if (lowerMessage.includes("forbidden") || lowerMessage.includes("403")) {
      Sentry.setTag("error_type", "forbidden");
      Sentry.setTag("likely_cause", "expired_key");
    }

    captureCriticalPathError({
      error,
      path: "lesson_video_url",
      requestId,
      tags: {
        lesson_slug: slug,
      },
    });

    console.error("Failed to generate signed lesson video URL", {
      slug,
      errorMessage: error instanceof Error ? error.message : "unknown_error",
    });

    const statusCode =
      lowerMessage.includes("cloudfront") || lowerMessage.includes("provider")
        ? 503
        : 500;

    return NextResponse.json<ResponseDataObject>(
      {
        success: false,
        error: "Failed to generate video URL",
      },
      { status: statusCode },
    );
  }
}
