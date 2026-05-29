"use server";

import { verifyAdminAccess } from "@/lib/admin";
import { env } from "@/lib/env";
import prisma from "@/lib/prisma";
import { resend } from "@/lib/resend";
import z from "zod";

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
      },
      select: {
        email: true,
      },
    });

    const recipientEmails = Array.from(
      new Set(
        recipientRows
          .map(function (row) {
            return row.email.trim().toLowerCase();
          })
          .filter(function (email) {
            return email.length > 0;
          }),
      ),
    );

    if (recipientEmails.length === 0) {
      return {
        success: false,
        error: "No recipients were found for the selected role.",
        code: "no_recipients",
      } satisfies BroadcastEmailActionState;
    }

    const sendResults = await Promise.allSettled(
      recipientEmails.map(function (email) {
        return resend.emails.send({
          from: `Felipe Calgaro <onboarding@${env.NEXT_PUBLIC_EMAIL_DOMAIN}>`,
          to: email,
          subject: validation.data.subject,
          html: validation.data.htmlBody,
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
      recipientCount: recipientEmails.length,
      sentCount: recipientEmails.length,
    } satisfies BroadcastEmailActionState;
  } catch {
    return {
      success: false,
      error: "Something went wrong while sending the broadcast.",
      code: "unexpected_error",
    } satisfies BroadcastEmailActionState;
  }
}
