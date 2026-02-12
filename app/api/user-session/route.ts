import { verifySession } from "@/lib/dal";
import { ResponseDataObject } from "@/utils/get-response-data-object";
import { NextResponse } from "next/server";

export async function GET() {
  const { isAuthenticated, userRole } = await verifySession();

  return NextResponse.json<ResponseDataObject>({
    success: true,
    data: {
      userRole,
      isAuthenticated,
    },
  });
}
