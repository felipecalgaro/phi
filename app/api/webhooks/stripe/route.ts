import { createCookiesSession } from "@/utils/create-cookies-session";
import { env } from "@/lib/env";
import { stripe } from "@/lib/stripe";
import { redirect } from "next/navigation";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { ResponseDataObject } from "@/utils/get-response-data-object";
import { applyRateLimiterBasedOnIP } from "@/utils/apply-rate-limiter-based-on-ip";

const checkoutSessionMetadataSchema = z.object({
  userId: z.uuid(),
});

async function processStripeCheckout(checkoutSession: Stripe.Checkout.Session) {
  const result = checkoutSessionMetadataSchema.safeParse(
    checkoutSession.metadata,
  );

  if (!result.success) {
    throw new Error("Invalid metadata in checkout session");
  }

  const { userId } = result.data;

  try {
    await Promise.all([
      prisma.user.update({
        where: {
          id: userId,
        },
        data: {
          role: "PREMIUM",
        },
      }),
      createCookiesSession({
        userId,
        userRole: "PREMIUM",
      }),
    ]);
  } catch {
    throw new Error("Failed to purchase course");
  }
}

export async function GET(req: NextRequest) {
  const { success } = await applyRateLimiterBasedOnIP();

  if (!success) {
    return NextResponse.json<ResponseDataObject>({
      success: false,
      error: "Too many requests, please try again later.",
    });
  }

  const sessionId = req.nextUrl.searchParams.get("session_id");

  if (!sessionId) {
    redirect("/acing-aufnahmetest/purchase/error");
  }

  let redirectUrl: string;
  try {
    const checkoutSession = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["line_items"],
    });

    await processStripeCheckout(checkoutSession);
    redirectUrl = "/acing-aufnahmetest/purchase/success";
  } catch {
    redirectUrl = "/acing-aufnahmetest/purchase/error";
  }

  return NextResponse.redirect(new URL(redirectUrl, req.url));
}

export async function POST(req: NextRequest) {
  const { success } = await applyRateLimiterBasedOnIP();

  if (!success) {
    return NextResponse.json<ResponseDataObject>({
      success: false,
      error: "Too many requests, please try again later.",
    });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      await req.text(),
      req.headers.get("stripe-signature") as string,
      env.STRIPE_WEBHOOK_SECRET,
    );
  } catch {
    return NextResponse.json<ResponseDataObject>(
      {
        success: false,
        error: "Error while verifying signature",
      },
      { status: 400 },
    );
  }

  switch (event.type) {
    case "checkout.session.completed":
    case "checkout.session.async_payment_succeeded":
      try {
        await processStripeCheckout(event.data.object);
      } catch {
        return NextResponse.json<ResponseDataObject>(
          {
            success: false,
            error: "Error while processing checkout session",
          },
          { status: 500 },
        );
      }
  }

  return new Response(null, { status: 200 });
}
