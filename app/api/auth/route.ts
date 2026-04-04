import prisma from "@/lib/prisma";
import { createCookiesSession } from "@/utils/create-cookies-session";
import { NextRequest, NextResponse } from "next/server";
import z from "zod";
import { verifyToken } from "@/lib/jwt";
import { ResponseDataObject } from "@/utils/get-response-data-object";
import { applyRateLimiter } from "@/utils/apply-rate-limiter";
import { redis } from "@/lib/redis";

const queryParamsSchema = z.jwt({ alg: "HS256" });
const MAGIC_LINK_MARKER_TTL_SECONDS = 60 * 15;

type MagicLinkConsumeResult = "OK" | "PENDING_MISSING" | "ALREADY_CONSUMED";

const consumeMagicLinkScript = redis.createScript<MagicLinkConsumeResult>(`
  local pending = redis.call("GET", KEYS[1])
  if not pending then
    return "PENDING_MISSING"
  end

  local claimed = redis.call("SET", KEYS[2], "1", "NX", "EX", ARGV[1])
  if not claimed then
    return "ALREADY_CONSUMED"
  end

  redis.call("DEL", KEYS[1])
  return "OK"
`);

const temporaryTokenPayloadSchema = z.object({
  email: z.email(),
  redirectToPurchase: z.boolean(),
  jti: z.uuid(),
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

  const { email, redirectToPurchase, jti } = parsedPayload;

  const { success } = await applyRateLimiter({
    failureMode: "fail-closed",
    email,
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

  const consumedMarkerKey = `magic_link_consumed:${jti}`;
  const pendingKey = `magic_link:${jti}`;

  const consumeResult = await consumeMagicLinkScript.exec(
    [pendingKey, consumedMarkerKey],
    [String(MAGIC_LINK_MARKER_TTL_SECONDS)],
  );

  if (consumeResult !== "OK") {
    return NextResponse.json<ResponseDataObject>(
      {
        success: false,
        error: "Invalid token",
      },
      { status: 400 },
    );
  }

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
