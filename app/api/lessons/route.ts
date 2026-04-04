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
        error: "Unauthorized",
      },
      { status: 403 },
    );
  }

  const lessons = await prisma.lesson.findMany({
    select: {
      slug: true,
      title: true,
      module: true,
      id: true,
    },
  });

  return NextResponse.json<ResponseDataObject>({
    success: true,
    data: {
      lessons,
    },
  });
}
