import { verifySession } from "@/lib/dal";
import { applyRateLimiterBasedOnIP } from "@/utils/apply-rate-limiter-based-on-ip";
import { getSignedLessonVideoUrl } from "@/utils/get-signed-lesson-video-url";
import { ResponseDataObject } from "@/utils/get-response-data-object";
import { NextResponse } from "next/server";

export async function GET(
  _: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { success } = await applyRateLimiterBasedOnIP();

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
    const signedVideoUrl = getSignedLessonVideoUrl(slug);

    return NextResponse.json<ResponseDataObject>({
      success: true,
      data: signedVideoUrl,
    });
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
