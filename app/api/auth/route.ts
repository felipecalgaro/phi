import prisma from "@/lib/prisma";
import { createCookiesSession } from "@/utils/create-cookies-session";
import { NextRequest, NextResponse } from "next/server";
import z from "zod";
import { verifyToken } from "@/lib/jwt";
import { ResponseDataObject } from "@/utils/get-response-data-object";
import { applyRateLimiter } from "@/utils/apply-rate-limiter";
import { redis } from "@/lib/redis";
import { MAGIC_LINK_MARKER_TTL_SECONDS } from "@/lib/magic-link";
import {
  deletePendingRoadmapAnswers,
  getPendingRoadmapAnswers,
  getRoadmapUserData,
  type RoadmapAnswers,
} from "@/lib/roadmap-generation";
import * as Sentry from "@sentry/nextjs";
import { captureCriticalPathError } from "@/lib/sentry-errors";
import {
  setRateLimitContext,
  setRequestId,
  setUserId,
} from "@/lib/sentry-context";

const queryParamsSchema = z.jwt({ alg: "HS256" });

const temporaryTokenPayloadSchema = z.object({
  email: z.email(),
  redirectTo: z.enum(["purchase", "roadmap"]).nullable(),
  jti: z.uuid(),
});

export async function GET(request: NextRequest) {
  const requestId = request.headers.get("x-request-id") ?? crypto.randomUUID();
  setRequestId(requestId);

  const result = queryParamsSchema.safeParse(
    request.nextUrl.searchParams.get("token"),
  );

  if (!result.success) {
    Sentry.setTag("error_type", "invalid_token");
    Sentry.captureMessage("token_invalid", { level: "warning" });

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
  } catch (error) {
    captureCriticalPathError({
      error,
      path: "auth_consume_magic_link",
      requestId,
      tags: {
        flow: "consume_magic_link",
      },
    });

    return NextResponse.json<ResponseDataObject>(
      {
        success: false,
        error: "Invalid token",
      },
      { status: 400 },
    );
  }

  const { email, redirectTo, jti } = parsedPayload;
  setRateLimitContext("email", jti);

  const { success } = await applyRateLimiter({
    failureMode: "fail-closed",
    email,
  });

  if (!success) {
    Sentry.setTag("error_type", "rate_limit");
    Sentry.captureMessage("auth_rate_limited", { level: "warning" });

    return NextResponse.json<ResponseDataObject>(
      {
        success: false,
        error: "Too many requests, please try again later.",
      },
      { status: 429 },
    );
  }

  const consumeErrorResponse = await consumeMagicLink(jti);

  if (consumeErrorResponse) {
    return consumeErrorResponse;
  }

  let roadmapAnswers: RoadmapAnswers | null = null;

  if (redirectTo === "roadmap") {
    try {
      roadmapAnswers = await getPendingRoadmapAnswers(jti);
    } catch (error) {
      captureCriticalPathError({
        error,
        path: "auth_consume_magic_link",
        requestId,
        tags: {
          flow: "roadmap_generation",
        },
      });

      return NextResponse.json<ResponseDataObject>(
        {
          success: false,
          error: "Error processing request",
        },
        { status: 500 },
      );
    }

    if (!roadmapAnswers) {
      Sentry.setTag("error_type", "invalid_token");
      Sentry.captureMessage("roadmap_generation_missing", {
        level: "warning",
      });

      return NextResponse.json<ResponseDataObject>(
        {
          success: false,
          error: "Invalid token",
        },
        { status: 400 },
      );
    }
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
        ...(roadmapAnswers ? getRoadmapUserData(roadmapAnswers) : {}),
      },
    });
  } else if (roadmapAnswers) {
    user = await prisma.user.update({
      where: {
        id: user.id,
      },
      data: getRoadmapUserData(roadmapAnswers),
    });
  }

  if (roadmapAnswers) {
    try {
      await deletePendingRoadmapAnswers(jti);
    } catch (error) {
      captureCriticalPathError({
        error,
        path: "auth_consume_magic_link",
        requestId,
        tags: {
          flow: "roadmap_generation_cleanup",
        },
      });
    }
  }

  await createCookiesSession({
    userId: user.id,
    userRole: user.role,
  });

  setUserId(user.id);

  const redirectPath =
    redirectTo === "purchase"
      ? "/acing-aufnahmetest/purchase"
      : redirectTo === "roadmap"
        ? "/roadmap"
        : "/";

  return NextResponse.redirect(new URL(redirectPath, request.url));
}

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

async function consumeMagicLink(jti: string) {
  const consumedMarkerKey = `magic_link_consumed:${jti}`;
  const pendingKey = `magic_link:${jti}`;

  const consumeResult = await consumeMagicLinkScript.exec(
    [pendingKey, consumedMarkerKey],
    [String(MAGIC_LINK_MARKER_TTL_SECONDS)],
  );

  if (consumeResult !== "OK") {
    if (consumeResult === "ALREADY_CONSUMED") {
      Sentry.setTag("error_type", "replay_detected");
      Sentry.captureMessage("concurrent_consume_attempt", {
        level: "warning",
      });
    } else {
      Sentry.setTag("error_type", "invalid_token");
      Sentry.captureMessage("token_invalid", { level: "warning" });
    }

    return NextResponse.json<ResponseDataObject>(
      {
        success: false,
        error: "Invalid token",
      },
      { status: 400 },
    );
  }
}
