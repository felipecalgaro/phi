import { verifySession } from "@/lib/dal";
import prisma from "@/lib/prisma";
import { applyRateLimiter } from "@/utils/apply-rate-limiter";
import { getSignedLessonVideoUrl } from "@/utils/get-signed-lesson-video-url";
import { ResponseDataObject } from "@/utils/get-response-data-object";
import { NextResponse } from "next/server";

export async function GET(
  _: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { success } = await applyRateLimiter({
    failureMode: "fail-open",
  });

  if (!success) {
    return NextResponse.json<ResponseDataObject>({
      success: false,
      error: "Too many requests, please try again later.",
    });
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

  try {
    const lesson = await prisma.lesson.findUnique({ where: { slug } });

    if (!lesson) {
      return NextResponse.json<ResponseDataObject>(
        {
          success: false,
          error: "Lesson not found",
        },
        { status: 404 },
      );
    }

    const signedVideoUrl = getSignedLessonVideoUrl(slug);

    const response = NextResponse.json<ResponseDataObject>({
      success: true,
      data: signedVideoUrl,
    });

    response.headers.set("Cache-Control", "private, no-store");

    return response;
  } catch (error) {
    console.error("Failed to generate signed lesson video URL", {
      slug,
      errorMessage: error instanceof Error ? error.message : "unknown_error",
    });

    return NextResponse.json<ResponseDataObject>(
      {
        success: false,
        error: "Failed to generate video URL",
      },
      { status: 500 },
    );
  }
}
