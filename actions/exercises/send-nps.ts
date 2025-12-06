"use server";

import { resend } from "@/lib/resend";

export async function sendNPS(data: { score: number }) {
  try {
    await resend.emails.send({
      from: "Phi AT MVP <onboarding@resend.dev>",
      to: "pipecalgaro@gmail.com",
      subject: "NPS Score",
      html: `<p>Score: ${data.score}</p>`,
    });
  } catch {
    return;
  }
}
