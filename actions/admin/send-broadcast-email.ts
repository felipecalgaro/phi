"use server";

import * as Sentry from "@sentry/nextjs";
import { Role } from "@/generated/prisma/enums";
import { verifySession } from "@/lib/dal";
import { env } from "@/lib/env";
import { createMarketingUnsubscribeUrl } from "@/lib/marketing-unsubscribe";
import prisma from "@/lib/prisma";
import { captureCriticalPathError } from "@/lib/sentry-errors";
import {
  setRateLimitContext,
  setRequestId,
  setUserId,
} from "@/lib/sentry-context";
import { emailService } from "@/services/email-service-instance";
import { applyRateLimiter } from "@/utils/apply-rate-limiter";
import { ResponseDataObject } from "@/utils/get-response-data-object";
import z from "zod";

const bodyClosingTagRegex = /<\/body\s*>/i;

const requestSchema = z
  .object({
    recipientRole: z.enum(["BASIC", "PREMIUM", "ADMIN"]),
    sendToMarketingSubscribersOnly: z.boolean(),
    subject: z.string().trim().min(1).max(120),
    htmlBody: z.string().trim().min(1).max(50000),
  })
  .strict();

export type BroadcastEmailRequest = z.infer<typeof requestSchema>;

export type BroadcastEmailData = {
  recipientCount: number;
  sentCount: number;
};

export async function sendBroadcastEmail(
  request: unknown,
): Promise<ResponseDataObject<BroadcastEmailData>> {
  const requestId = crypto.randomUUID();
  setRequestId(requestId);

  const parsedRequest = requestSchema.safeParse(request);

  if (!parsedRequest.success) {
    Sentry.setTag("error_type", "invalid_payload");

    return {
      success: false,
      error: "Invalid request data. Please try again.",
    };
  }

  const { isAuthenticated, userId } = await verifySession();

  if (!isAuthenticated) {
    Sentry.setTag("error_type", "forbidden");

    return {
      success: false,
      error: "Unauthorized. Please log in and try again.",
    };
  }

  setUserId(userId);
  setRateLimitContext("user", userId);

  const { success: rateLimitSuccess } = await applyRateLimiter({
    failureMode: "fail-closed",
    userId,
  });

  if (!rateLimitSuccess) {
    Sentry.setTag("error_type", "rate_limit");
    Sentry.captureMessage("send_broadcast_email_rate_limited", {
      level: "warning",
    });

    return {
      success: false,
      error: "Too many requests, please try again later.",
    };
  }

  let user: { role: Role } | null;

  try {
    user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        role: true,
      },
    });
  } catch (error) {
    captureCriticalPathError({
      error,
      path: "send_broadcast_email",
      requestId,
      tags: {
        error_type: "database_error",
      },
    });

    return {
      success: false,
      error: "Error processing request. Please try again later.",
    };
  }

  if (!user || user.role !== Role.ADMIN) {
    Sentry.setTag("error_type", "forbidden");

    return {
      success: false,
      error: "You do not have permission to send broadcast email.",
    };
  }

  try {
    const marketingSubscriptionFilter =
      parsedRequest.data.sendToMarketingSubscribersOnly
        ? {
            OR: [
              {
                subscribedToMarketing: true,
              },
              {
                subscribedToMarketing: null,
              },
            ],
          }
        : {};

    const recipientRows = await prisma.user.findMany({
      where: {
        role: parsedRequest.data.recipientRole,
        ...marketingSubscriptionFilter,
      },
      select: {
        id: true,
        email: true,
      },
    });

    const recipients = recipientRows
      .map(function (row) {
        return {
          userId: row.id,
          email: row.email.trim().toLowerCase(),
        };
      })
      .filter(function (recipient) {
        return recipient.email.length > 0;
      });

    if (recipients.length === 0) {
      return {
        success: false,
        error: "No recipients were found for the selected role.",
      };
    }

    const sendResults = await Promise.allSettled(
      recipients.map(async function (recipient) {
        const unsubscribeUrl = await createMarketingUnsubscribeUrl(recipient);

        return emailService.sendEmail({
          from: `Felipe Calgaro <contact@${env.NEXT_PUBLIC_EMAIL_DOMAIN}>`,
          to: recipient.email,
          subject: parsedRequest.data.subject,
          html: appendMarketingUnsubscribeFooter({
            htmlBody: parsedRequest.data.htmlBody,
            unsubscribeUrl,
          }),
        });
      }),
    );

    const failedSendCount = sendResults.filter(function (result) {
      return result.status === "rejected";
    }).length;

    if (failedSendCount > 0) {
      captureCriticalPathError({
        error: new Error("One or more broadcast emails could not be sent."),
        path: "send_broadcast_email",
        requestId,
        tags: {
          error_type: "provider_error",
        },
        extra: {
          recipientCount: recipients.length,
          failedSendCount,
        },
      });

      return {
        success: false,
        error: "One or more emails could not be sent.",
      };
    }

    return {
      success: true,
      data: {
        recipientCount: recipients.length,
        sentCount: recipients.length,
      },
    };
  } catch (error) {
    captureCriticalPathError({
      error,
      path: "send_broadcast_email",
      requestId,
    });

    return {
      success: false,
      error: "Something went wrong while sending the broadcast.",
    };
  }
}

function appendMarketingUnsubscribeFooter({
  htmlBody,
  unsubscribeUrl,
}: {
  htmlBody: string;
  unsubscribeUrl: string;
}) {
  const footerHtml = `
    <div style="margin-top:32px;padding-top:16px;border-top:1px solid #e5e7eb;color:#6b7280;font-family:Arial,sans-serif;font-size:12px;line-height:1.5;">
      <p style="margin:0;">
        You are receiving this email because you signed up for Guide to Studienkolleg updates.
        You can <a href="${unsubscribeUrl}" style="color:#374151;text-decoration:underline;">unsubscribe from these emails</a> at any time.
      </p>
    </div>
  `;

  if (bodyClosingTagRegex.test(htmlBody)) {
    return htmlBody.replace(bodyClosingTagRegex, `${footerHtml}$&`);
  }

  return `${htmlBody}${footerHtml}`;
}
