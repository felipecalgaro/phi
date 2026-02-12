import { NextRequest, NextResponse } from "next/server";
import { getSignedUrl } from "@aws-sdk/cloudfront-signer";
import { env } from "@/lib/env";
import { verifySession } from "@/lib/dal";
import { redirect } from "next/navigation";
import { ResponseDataObject } from "@/utils/get-response-data-object";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const { isAuthenticated, userRole } = await verifySession();

  if (!isAuthenticated) {
    redirect("/acing-aufnahmetest/login");
  }

  if (userRole === "BASIC") {
    redirect("/acing-aufnahmetest/purchase");
  }

  const slug = request.nextUrl.searchParams.get("slug");

  if (!slug) {
    return NextResponse.json<ResponseDataObject>(
      {
        success: false,
        error: "Missing slug query parameter",
      },
      { status: 400 },
    );
  }

  const distributionDomain = env.CLOUDFRONT_DOMAIN;
  const keyPairId = env.CLOUDFRONT_PUBLIC_KEY;
  const privateKey = env.CLOUDFRONT_PRIVATE_KEY;

  const videoUrl = `https://${distributionDomain}/videos/${slug}.mp4`;

  try {
    const signedUrl = getSignedUrl({
      url: videoUrl,
      keyPairId,
      privateKey,
      dateLessThan: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
    });

    return NextResponse.json<ResponseDataObject>({
      success: true,
      data: {
        signedUrl,
      },
    });
  } catch {
    return NextResponse.json<ResponseDataObject>(
      {
        success: false,
        error: "Failed to generate signed URL",
      },
      { status: 500 },
    );
  }
}
