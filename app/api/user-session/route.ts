import { verifySession } from "@/lib/dal";
import { applyRateLimiterBasedOnIP } from "@/utils/apply-rate-limiter-based-on-ip";
import { ResponseDataObject } from "@/utils/get-response-data-object";
import { NextResponse } from "next/server";

export async function GET() {
  const { success } = await applyRateLimiterBasedOnIP();

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
