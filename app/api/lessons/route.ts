import { verifySession } from "@/lib/dal";
import prisma from "@/lib/prisma";
import { ResponseDataObject } from "@/utils/get-response-data-object";
import { redirect } from "next/navigation";
import { NextResponse } from "next/server";

export async function GET() {
  const { isAuthenticated, userRole } = await verifySession();

  if (!isAuthenticated) {
    redirect("/acing-aufnahmetest/login");
  }

  if (userRole === "BASIC") {
    redirect("/acing-aufnahmetest/purchase");
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
