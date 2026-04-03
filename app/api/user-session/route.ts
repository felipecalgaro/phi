import { verifySession } from "@/lib/dal";
import { applyRateLimiter } from "@/utils/apply-rate-limiter";
import { ResponseDataObject } from "@/utils/get-response-data-object";
import { NextResponse } from "next/server";

export async function GET() {
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

  return NextResponse.json<ResponseDataObject>({
    success: true,
    data: {
      userRole,
      isAuthenticated,
    },
  });
}
