"use server";

import { verifySession } from "@/lib/dal";
import { env } from "@/lib/env";
import prisma from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import { applyRateLimiterBasedOnIP } from "@/utils/apply-rate-limiter-based-on-ip";

export async function getClientSessionSecret() {
  const { success } = await applyRateLimiterBasedOnIP();

  if (!success) {
    throw new Error("Too many requests, please try again later.");
  }

  const { isAuthenticated, userId } = await verifySession();

  if (!isAuthenticated) {
    throw new Error("User is not authenticated");
  }

  const { email } = await prisma.user.findUniqueOrThrow({
    where: {
      id: userId,
    },
    select: {
      email: true,
    },
  });

  const session = await stripe.checkout.sessions.create(
    {
      line_items: [
        {
          quantity: 1,
          price: env.STRIPE_PRICE_ID,
        },
      ],
      customer_email: email,
      ui_mode: "embedded",
      mode: "payment",
      return_url: `${env.NEXT_PUBLIC_URL}/api/webhooks/stripe?session_id={CHECKOUT_SESSION_ID}`,
      payment_method_types: ["card"],
      metadata: {
        userId,
      },
    },
    {
      idempotencyKey: userId,
    },
  );

  if (session.client_secret === null) {
    throw new Error("Unexpected error");
  }

  return session.client_secret;
}
