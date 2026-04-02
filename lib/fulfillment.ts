import prisma from "./prisma";
import { resend } from "./resend";
import { env } from "./env";
import Stripe from "stripe";
import { z } from "zod";

const checkoutSessionMetadataSchema = z.object({
  userId: z.uuid(),
});

interface FulfillmentResult {
  userEmail?: string;
  userRole?: string;
  roleUpdated: boolean;
}

interface FulfillmentError extends Error {
  isRetryable?: boolean;
}

export function verifyCheckoutSessionPrice(
  checkoutSession: Stripe.Checkout.Session,
): void {
  if (
    !checkoutSession.line_items ||
    checkoutSession.line_items.data.length === 0
  ) {
    throw new Error("No items in checkout session");
  }

  const hasExpectedPrice = checkoutSession.line_items.data.some(
    (item) => item.price?.id === env.STRIPE_PRICE_ID,
  );

  if (!hasExpectedPrice) {
    throw new Error("Unexpected product in checkout session");
  }
}

async function extractMetadataUserId(
  checkoutSession: Stripe.Checkout.Session,
): Promise<string> {
  const result = checkoutSessionMetadataSchema.safeParse(
    checkoutSession.metadata,
  );

  if (!result.success) {
    const error = new Error(
      "Invalid metadata in checkout session",
    ) as FulfillmentError;
    error.isRetryable = false;
    throw error;
  }

  return result.data.userId;
}

export async function fulfillPremiumAccess(
  checkoutSession: Stripe.Checkout.Session,
  verifyPrice: boolean = false,
): Promise<FulfillmentResult> {
  const userId = await extractMetadataUserId(checkoutSession);

  if (checkoutSession.payment_status !== "paid") {
    const error = new Error(
      "Payment was not completed successfully",
    ) as FulfillmentError;
    error.isRetryable = false;
    throw error;
  }

  if (verifyPrice) {
    verifyCheckoutSessionPrice(checkoutSession);
  }

  try {
    const user = await prisma.user.findUniqueOrThrow({
      where: { id: userId },
      select: { role: true, email: true },
    });

    let roleUpdated = false;

    if (user.role !== "PREMIUM") {
      await prisma.user.update({
        where: { id: userId },
        data: { role: "PREMIUM" },
      });
      roleUpdated = true;
    }

    return {
      userEmail: user.email,
      userRole: "PREMIUM",
      roleUpdated,
    };
  } catch (error) {
    if (error instanceof Error && error.message.includes("No user found")) {
      const err = new Error("User not found") as FulfillmentError;
      err.isRetryable = false;
      throw err;
    }

    if (
      error instanceof Error &&
      (error.message.includes("timeout") ||
        error.message.includes("ECONNREFUSED"))
    ) {
      const err = new Error(
        "Database operation failed transiently",
      ) as FulfillmentError;
      err.isRetryable = true;
      throw err;
    }

    throw error;
  }
}

export async function sendPurchaseConfirmationEmail(
  userEmail: string,
): Promise<void> {
  try {
    await resend.emails.send({
      from: `Acing Aufnahmetest <onboarding@${env.EMAIL_DOMAIN}>`,
      to: userEmail,
      subject: "Welcome to Acing Aufnahmetest!",
      html: `
      <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
        <h2 style="color: #000;">Welcome to Acing Aufnahmetest!</h2>
        <p>Your payment has been successfully processed. You now have full access to our complete study course.</p>
        <p>You can start learning right away at <a href="${env.NEXT_PUBLIC_URL}/acing-aufnahmetest/lessons" style="color: #0066cc; text-decoration: none;">${env.NEXT_PUBLIC_URL}/acing-aufnahmetest/lessons</a></p>
        <p>If you have any questions, feel free to reach out to us.</p>
        <p>Best of luck with your studies!</p>
      </div>
    `,
    });
  } catch (error) {
    console.error("Failed to send purchase confirmation email:", {
      error: error instanceof Error ? error.message : String(error),
      userEmail,
    });
    throw error;
  }
}
