"use server";

import { resend } from "@/lib/resend";

export async function sendEmail(data: { email: string }) {
  await resend.emails.send({
    from: "Acing Aufnahmetest Contact <onboarding@resend.dev>",
    to: "pipecalgaro@gmail.com",
    subject: "Notification request",
    html: `<p>Notification request from ${data.email}</p>`,
  });
}
