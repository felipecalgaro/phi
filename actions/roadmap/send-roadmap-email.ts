"use server";

import * as Sentry from "@sentry/nextjs";
import { z } from "zod";
import { env } from "@/lib/env";
import { createMagicLink } from "@/lib/magic-link";
import {
  roadmapAnswersSchema,
  storePendingRoadmapAnswers,
} from "@/lib/roadmap-generation";
import { captureCriticalPathError } from "@/lib/sentry-errors";
import { setRequestId } from "@/lib/sentry-context";
import { emailService } from "@/services/email-service-instance";
import { applyMagicLinkRateLimit } from "@/utils/apply-magic-link-rate-limit";
import { ResponseDataObject } from "@/utils/get-response-data-object";

const requestSchema = z.object({
  email: z.email("Please provide a valid e-mail"),
  answers: roadmapAnswersSchema,
});

export async function sendRoadmapEmail(
  request: unknown,
): Promise<ResponseDataObject> {
  const requestId = crypto.randomUUID();
  setRequestId(requestId);

  const requestData = requestSchema.safeParse(request);

  if (!requestData.success) {
    Sentry.setTag("error_type", "invalid_payload");

    return {
      success: false,
      error: "Invalid request data. Please try again.",
    };
  }

  const { answers } = requestData.data;
  const email = requestData.data.email.trim().toLowerCase();

  const rateLimitResult = await applyMagicLinkRateLimit({
    email,
    path: "send_roadmap_email",
    requestId,
  });

  if (!rateLimitResult.success) {
    return rateLimitResult;
  }

  try {
    const { jti, magicLink } = await createMagicLink({
      email,
      redirectTo: "roadmap",
    });

    await storePendingRoadmapAnswers({
      jti,
      answers,
    });

    await emailService.sendEmail({
      from: `Guide to Studienkolleg <info@${env.NEXT_PUBLIC_EMAIL_DOMAIN}>`,
      to: email,
      subject: "Your Studienkolleg roadmap is ready",
      html: `
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
        - Guide to Studienkolleg
        </p>
      `,
    });
  } catch (error) {
    captureCriticalPathError({
      error,
      path: "send_roadmap_email",
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
