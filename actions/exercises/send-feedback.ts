"use server";

import { resend } from "@/lib/resend";

export async function sendFeedback(_: boolean, data: FormData) {
  const feedback = data.get("feedback");

  try {
    await resend.emails.send({
      from: "Phi AT MVP <onboarding@resend.dev>",
      to: "pipecalgaro@gmail.com",
      subject: "Feedback",
      html: `<p>${feedback}</p>`,
    });
  } finally {
    return true;
  }
}
