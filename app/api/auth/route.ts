import { prisma } from "@/lib/prisma";
import { createCookiesSession } from "@/utils/create-cookies-session";
import { NextRequest, NextResponse } from "next/server";
import z from "zod";
import { verifyToken } from "@/lib/jwt";
import { ResponseDataObject } from "@/utils/get-response-data-object";

const queryParamsSchema = z.jwt({ alg: "HS256" });

const temporaryTokenPayloadSchema = z.object({
  email: z.email(),
  redirectToPurchase: z.boolean(),
});

export async function GET(request: NextRequest) {
  const result = queryParamsSchema.safeParse(
    request.nextUrl.searchParams.get("token"),
  );

  if (!result.success) {
    return NextResponse.json<ResponseDataObject>(
      {
        success: false,
        error: "Invalid query parameters",
      },
      { status: 400 },
    );
  }

  let parsedPayload: z.infer<typeof temporaryTokenPayloadSchema>;
  try {
    const { payload } = await verifyToken(result.data);

    parsedPayload = temporaryTokenPayloadSchema.parse(payload);
  } catch {
    return NextResponse.json<ResponseDataObject>(
      {
        success: false,
        error: "Invalid token",
      },
      { status: 400 },
    );
  }

  const { email, redirectToPurchase } = parsedPayload;

  let user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    user = await prisma.user.create({
      data: {
        email,
        role: "BASIC",
      },
    });
  }

  await createCookiesSession({
    userId: user.id,
    userRole: user.role,
  });

  if (user.role !== "BASIC") {
    return NextResponse.redirect(
      new URL("/acing-aufnahmetest/lessons", request.url),
    );
  }

  return NextResponse.redirect(
    new URL(
      `/acing-aufnahmetest${redirectToPurchase ? "/purchase" : ""}`,
      request.url,
    ),
  );
}
