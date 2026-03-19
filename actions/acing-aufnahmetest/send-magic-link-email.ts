"use server";

import z from "zod";
import { resend } from "@/lib/resend";
import { createToken } from "@/lib/jwt";
import { env } from "@/lib/env";
import { cookies } from "next/headers";
import { emailRateLimiter } from "@/lib/rate-limiters";
import { getUserIp } from "@/utils/get-user-ip";
import { redis } from "@/lib/redis";

const requestSchema = z.object({
  email: z.email("Please provide a valid e-mail"),
});

export async function sendMagicLinkEmail(request: unknown) {
  const result = requestSchema.safeParse(request);

  if (!result.success) {
    return {
      success: false,
      error: "Invalid request data",
    };
  }

  const email = result.data.email.trim().toLowerCase();

  const ip = await getUserIp();
  const rateLimitKey = ip ? `ip:${ip}` : `email:${email}`;

  const { success } = await emailRateLimiter.limit(rateLimitKey);

  if (!success) {
    return {
      success: false,
      error: "Too many requests, please try again later.",
    };
  }

  const cookiesStore = await cookies();

  const redirectToPurchase =
    cookiesStore.get("redirect_to_purchase")?.value === "true";

  const magicLinkJti = crypto.randomUUID();

  const temporaryToken = await createToken(
    {
      email,
      redirectToPurchase,
      jti: magicLinkJti,
    },
    "15min",
  );

  await redis.set(`magic_link:${magicLinkJti}`, "pending", {
    ex: 60 * 15,
  });

  cookiesStore.set("redirect_to_purchase", "false");

  const magicLink = `${env.NEXT_PUBLIC_URL}/api/auth?token=${temporaryToken}`;

  try {
    await resend.emails.send({
      from: `Felipe Calgaro <onboarding@${env.EMAIL_DOMAIN}>`,
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
        — Guide to Studienkolleg
        </p>
      `,
    });
  } catch {
    return {
      success: false,
      error: "Error sending email. Please try again later",
    };
  }

  return {
    success: true,
  };
}
