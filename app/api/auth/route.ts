import prisma from "@/lib/prisma";
import { createCookiesSession } from "@/utils/create-cookies-session";
import { NextRequest, NextResponse } from "next/server";
import z from "zod";
import { verifyToken } from "@/lib/jwt";
import { ResponseDataObject } from "@/utils/get-response-data-object";
import { applyRateLimiterBasedOnIP } from "@/utils/apply-rate-limiter-based-on-ip";
import { redis } from "@/lib/redis";

const queryParamsSchema = z.jwt({ alg: "HS256" });

const temporaryTokenPayloadSchema = z.object({
  email: z.email(),
  redirectToPurchase: z.boolean(),
  jti: z.uuid(),
});

export async function GET(request: NextRequest) {
  const { success } = await applyRateLimiterBasedOnIP();

  if (!success) {
    return NextResponse.json<ResponseDataObject>({
      success: false,
      error: "Too many requests, please try again later.",
    });
  }

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

  const { email, redirectToPurchase, jti } = parsedPayload;

  const consumedMarkerKey = `magic_link_consumed:${jti}`;
  const pendingKey = `magic_link:${jti}`;

  const consumeAttempt = await redis.set(consumedMarkerKey, "1", {
    nx: true,
    ex: 60 * 15,
  });

  if (consumeAttempt !== "OK") {
    return NextResponse.json<ResponseDataObject>(
      {
        success: false,
        error: "Invalid token",
      },
      { status: 400 },
    );
  }

  const pendingToken = await redis.get<string>(pendingKey);

  if (!pendingToken) {
    return NextResponse.json<ResponseDataObject>(
      {
        success: false,
        error: "Invalid token",
      },
      { status: 400 },
    );
  }

  await redis.del(pendingKey);

  const normalizedEmail = email.trim().toLowerCase();

  let user = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });

  if (!user) {
    user = await prisma.user.create({
      data: {
        email: normalizedEmail,
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
