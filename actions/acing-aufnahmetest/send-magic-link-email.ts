"use server";

import z from "zod";
import { resend } from "@/lib/resend";
import { createToken } from "@/lib/jwt";
import { env } from "@/lib/env";
import { emailRateLimiter, rateLimiter } from "@/lib/rate-limiters";
import { getUserIp } from "@/utils/get-user-ip";
import { redis } from "@/lib/redis";
import * as Sentry from "@sentry/nextjs";
import prisma from "@/lib/prisma";
import { captureCriticalPathError } from "@/lib/sentry-errors";
import {
  setRateLimitContext,
  setRequestId,
  setUserId,
} from "@/lib/sentry-context";

const requestSchema = z.object({
  email: z.email("Please provide a valid e-mail"),
  redirectTo: z.enum(["purchase", "roadmap"]).nullable(),
  answers: z
    .object({
      countryOfHighschool: z.string().min(1),
      citizenships: z.array(z.string()).min(1),
      plannedStudienkollegs: z.array(z.uuid()),
      plannedAttendance: z.object({
        year: z.string().min(1),
        semester: z.enum(["WINTER", "SUMMER"]),
      }),
      subscribedToMarketing: z.boolean(),
    })
    .optional(),
});

type SendMagicLinkRequest = z.infer<typeof requestSchema>;

export async function sendMagicLinkEmail(request: unknown) {
  const requestId = crypto.randomUUID();
  setRequestId(requestId);

  const result = requestSchema.safeParse(request);

  if (!result.success) {
    Sentry.setTag("error_type", "invalid_payload");

    return {
      success: false,
      error: "Invalid request data",
    };
  }

  const email = result.data.email.trim().toLowerCase();
  const redirectTo = result.data.redirectTo ?? null;

  if (redirectTo === "roadmap" && !result.data.answers) {
    Sentry.setTag("error_type", "invalid_payload");

    return {
      success: false,
      error: "Invalid request data",
    };
  }

  const existingUser = await prisma.user.findUnique({
    where: { email },
    select: { id: true },
  });

  if (existingUser) {
    setUserId(existingUser.id);
  }

  await applyMagicLinkRateLimit({
    email,
    requestId,
  });

  const temporaryToken = await createTemporaryToken({
    email,
    redirectTo,
    answers: result.data.answers,
  });

  const magicLink = `${env.NEXT_PUBLIC_URL}/api/auth?token=${temporaryToken}`;
  const emailCopy = getEmailCopy(redirectTo);

  try {
    await resend.emails.send({
      from: `Felipe Calgaro <onboarding@${env.NEXT_PUBLIC_EMAIL_DOMAIN}>`,
      to: email,
      subject: emailCopy.subject,
      html: emailCopy.html(magicLink),
    });
  } catch (error) {
    captureCriticalPathError({
      error,
      path: "send_magic_link_email",
      requestId,
      tags: {
        error_type: "email_provider",
      },
    });

    return {
      success: false,
      error: "Error sending email. Please try again later",
    };
  }

  return {
    success: true,
  };
}

async function createTemporaryToken({
  email,
  redirectTo,
  answers,
}: SendMagicLinkRequest) {
  const magicLinkJti = crypto.randomUUID();

  const temporaryToken = await createToken(
    {
      email,
      redirectTo,
      ...(redirectTo === "roadmap" && answers ? { answers } : {}),
      jti: magicLinkJti,
    },
    "15min",
  );

  await redis.set(`magic_link:${magicLinkJti}`, "pending", {
    ex: 60 * 15,
  });

  return temporaryToken;
}

function getEmailCopy(redirectTo: SendMagicLinkRequest["redirectTo"]) {
  if (redirectTo === "roadmap") {
    return {
      subject: "Your Studienkolleg roadmap is ready",
      html: function (magicLink: string) {
        return `
          <p>Hello,</p>

          <p>
          Your roadmap to Studienkolleg is ready! Click the link below to see it.
          </p>

          <p>
          <a href="${magicLink}" style="display:inline-block;padding:10px 16px;background:#ffcc00;color:#111;text-decoration:none;border-radius:6px;">
          View your roadmap
          </a>
          </p>

          <p>
          This link is valid for <strong>15 minutes</strong> and can be used only once.
          </p>

          <p>
          If you did not request this email, you can safely ignore it.
          </p>

          <p>
          — Guide to Studienkolleg
          </p>
        `;
      },
    };
  }

  return {
    subject: "Login to Guide to Studienkolleg",
    html: function (magicLink: string) {
      return `
        <p>Hello,</p>

        <p>
        You requested a secure login link for your Guide to Studienkolleg account.
        </p>

        <p>
        <a href="${magicLink}" style="display:inline-block;padding:10px 16px;background:#ffcc00;color:#111;text-decoration:none;border-radius:6px;">
        Log in to your account
        </a>
        </p>

        <p>
        This link is valid for <strong>15 minutes</strong> and can be used only once.
        </p>

        <p>
        If you did not request this email, you can safely ignore it.
        </p>

        <p>
        — Guide to Studienkolleg
        </p>
      `;
    },
  };
}

async function applyMagicLinkRateLimit({
  email,
  requestId,
}: { email?: string; requestId?: string } = {}) {
  const ip = await getUserIp();

  const checks = [
    {
      limit: async function () {
        return await emailRateLimiter.limit(this.key);
      },
      key: `email:${email}`,
    },
    {
      limit: async function () {
        return await rateLimiter.limit(this.key);
      },
      key: `ip:${ip ?? "unknown"}`,
    },
  ];

  for (const check of checks) {
    const keyType = check.key.startsWith("email:")
      ? "email"
      : check.key.startsWith("ip:")
        ? "ip"
        : "user";

    setRateLimitContext(keyType, check.key);

    try {
      const { success } = await check.limit();

      if (!success) {
        Sentry.setTag("error_type", "rate_limit");
        Sentry.captureMessage("magic_link_rate_limited", {
          level: "warning",
        });

        return {
          success: false,
          error: "Too many requests, please try again later.",
        };
      }
    } catch (error) {
      captureCriticalPathError({
        error,
        path: "send_magic_link_email",
        requestId,
        tags: {
          rate_limit_key_type: keyType,
        },
      });

      console.error("Rate limiter check failed", {
        rateLimitKey: check.key,
        errorMessage: error instanceof Error ? error.message : "unknown_error",
      });

      return {
        success: false,
        error: "Error processing request. Please try again later.",
      };
    }
  }
}
