"use server";

import { verifySession } from "@/lib/dal";
import { env } from "@/lib/env";
import prisma from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import { applyRateLimiter } from "@/utils/apply-rate-limiter";

const CHECKOUT_IDEMPOTENCY_WINDOW_SECONDS = 30;

function getCheckoutSessionIdempotencyKey(userId: string) {
  const windowBucket = Math.floor(
    Date.now() / (CHECKOUT_IDEMPOTENCY_WINDOW_SECONDS * 1000),
  );

  return `checkout:${userId}:${env.STRIPE_PRICE_ID}:${windowBucket}`;
}

export async function getClientSessionSecret() {
  const { isAuthenticated, userId } = await verifySession();

  if (!isAuthenticated) {
    throw new Error("User is not authenticated");
  }

  const { success } = await applyRateLimiter({
    failureMode: "fail-closed",
    userId,
  });

  if (!success) {
    throw new Error("Too many requests, please try again later.");
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
      return_url: `${env.NEXT_PUBLIC_URL}/acing-aufnahmetest/purchase/result?session_id={CHECKOUT_SESSION_ID}`,
      payment_method_types: ["card"],
      metadata: {
        userId,
      },
    },
    {
      idempotencyKey: getCheckoutSessionIdempotencyKey(userId),
    },
  );

  if (session.client_secret === null) {
    throw new Error("Unexpected error");
  }

  return session.client_secret;
}
