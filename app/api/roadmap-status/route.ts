import { verifySession } from "@/lib/dal";
import prisma from "@/lib/prisma";
import { applyRateLimiter } from "@/utils/apply-rate-limiter";
import { ResponseDataObject } from "@/utils/get-response-data-object";
import { NextResponse } from "next/server";

export async function GET() {
  const { success } = await applyRateLimiter({
    failureMode: "fail-open",
  });

  if (!success) {
    return NextResponse.json<ResponseDataObject>(
      {
        success: false,
        error: "Too many requests, please try again later.",
      },
      { status: 429 },
    );
  }

  const { isAuthenticated, userId } = await verifySession();

  if (!isAuthenticated || !userId) {
    return NextResponse.json<ResponseDataObject>({
      success: true,
      data: {
        hasRoadmapGenerated: false,
      },
    });
  }

  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    select: {
      countryOfHighschool: true,
    },
  });

  return NextResponse.json<ResponseDataObject>({
    success: true,
    data: {
      hasRoadmapGenerated: Boolean(user?.countryOfHighschool),
    },
  });
}
