"use server";

import { verifyAdminAccess } from "@/lib/admin";
import { env } from "@/lib/env";
import { createMarketingUnsubscribeUrl } from "@/lib/marketing-unsubscribe";
import prisma from "@/lib/prisma";
import { emailService } from "@/services/email-service-instance";
import z from "zod";

const bodyClosingTagRegex = /<\/body\s*>/i;

const broadcastEmailSchema = z
  .object({
    recipientRole: z.enum(["BASIC", "PREMIUM"]),
    subject: z.string().trim().min(1).max(120),
    htmlBody: z.string().trim().min(1).max(50000),
  })
  .strict();

export type BroadcastEmailActionState =
  | {
      success: true;
      recipientCount: number;
      sentCount: number;
    }
  | {
      success: false;
      error: string;
      code:
        | "invalid_payload"
        | "unauthorized"
        | "forbidden"
        | "no_recipients"
        | "provider_error"
        | "unexpected_error";
    };

export async function sendBroadcastEmail(
  _previousState: BroadcastEmailActionState | null,
  formData: FormData,
) {
  try {
    const payload = {
      recipientRole: formData.get("recipientRole"),
      subject: formData.get("subject"),
      htmlBody: formData.get("htmlBody"),
    };

    const validation = broadcastEmailSchema.safeParse(payload);

    if (!validation.success) {
      return {
        success: false,
        error: "Please check the form and try again.",
        code: "invalid_payload",
      } satisfies BroadcastEmailActionState;
    }

    const access = await verifyAdminAccess();

    if (!access.ok) {
      return {
        success: false,
        error:
          access.code === "unauthorized"
            ? "Please sign in to continue."
            : "You do not have permission to send broadcast email.",
        code: access.code,
      } satisfies BroadcastEmailActionState;
    }

    const recipientRows = await prisma.user.findMany({
      where: {
        role: validation.data.recipientRole,
        OR: [
          {
            subscribedToMarketing: true,
          },
          {
            subscribedToMarketing: null,
          },
        ],
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
        code: "no_recipients",
      } satisfies BroadcastEmailActionState;
    }

    const sendResults = await Promise.allSettled(
      recipients.map(async function (recipient) {
        const unsubscribeUrl = await createMarketingUnsubscribeUrl(recipient);

        return emailService.sendEmail({
          from: `Felipe Calgaro <contact@${env.NEXT_PUBLIC_EMAIL_DOMAIN}>`,
          to: recipient.email,
          subject: validation.data.subject,
          html: appendMarketingUnsubscribeFooter({
            htmlBody: validation.data.htmlBody,
            unsubscribeUrl,
          }),
        });
      }),
    );

    if (
      sendResults.some(function (result) {
        return result.status === "rejected";
      })
    ) {
      return {
        success: false,
        error: "One or more emails could not be sent.",
        code: "provider_error",
      } satisfies BroadcastEmailActionState;
    }

    return {
      success: true,
      recipientCount: recipients.length,
      sentCount: recipients.length,
    } satisfies BroadcastEmailActionState;
  } catch {
    return {
      success: false,
      error: "Something went wrong while sending the broadcast.",
      code: "unexpected_error",
    } satisfies BroadcastEmailActionState;
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
