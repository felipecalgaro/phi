"use server";

import * as Sentry from "@sentry/nextjs";
import z from "zod";
import { env } from "@/lib/env";
import { createMagicLink } from "@/lib/magic-link";
import prisma from "@/lib/prisma";
import { captureCriticalPathError } from "@/lib/sentry-errors";
import { setRequestId, setUserId } from "@/lib/sentry-context";
import { emailService } from "@/services/email-service-instance";
import { applyMagicLinkRateLimit } from "@/utils/apply-magic-link-rate-limit";
import { ResponseDataObject } from "@/utils/get-response-data-object";

const requestSchema = z.object({
  email: z.email("Please provide a valid e-mail"),
  redirectTo: z.enum(["purchase"]).nullable().optional(),
});

export async function sendLoginEmail(
  request: unknown,
): Promise<ResponseDataObject> {
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

  const existingUser = await prisma.user.findUnique({
    where: { email },
    select: { id: true },
  });

  if (existingUser) {
    setUserId(existingUser.id);
  }

  const rateLimitResult = await applyMagicLinkRateLimit({
    email,
    path: "send_login_email",
    requestId,
  });

  if (!rateLimitResult.success) {
    return rateLimitResult;
  }

  try {
    const { magicLink } = await createMagicLink({
      email,
      redirectTo,
    });

    await emailService.sendEmail({
      from: `Guide to Studienkolleg <info@${env.NEXT_PUBLIC_EMAIL_DOMAIN}>`,
      to: email,
      subject: "Login to Guide to Studienkolleg",
      html: `
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
        - Guide to Studienkolleg
        </p>
      `,
    });
  } catch (error) {
    captureCriticalPathError({
      error,
      path: "send_login_email",
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
