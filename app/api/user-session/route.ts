import { verifySession } from "@/lib/dal";
import { NextResponse } from "next/server";

export async function GET() {
  const { isAuthenticated, userRole } = await verifySession();

  return NextResponse.json({
    success: true,
    data: {
      userRole,
      isAuthenticated,
    },
  });
}
