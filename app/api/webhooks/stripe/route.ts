import { createCookiesSession } from "@/utils/create-cookies-session";
import { env } from "@/lib/env";
import { stripe } from "@/lib/stripe";
import { redirect } from "next/navigation";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { ResponseDataObject } from "@/utils/get-response-data-object";
import { verifySession } from "@/lib/dal";
import { resend } from "@/lib/resend";

const checkoutSessionMetadataSchema = z.object({
  userId: z.uuid(),
});

// Verify that the checkout session includes the expected product price
function verifyCheckoutSessionPrice(
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

async function processStripeCheckout(
  checkoutSession: Stripe.Checkout.Session,
  options?: { verifyPrice?: boolean; sendEmail?: boolean },
): Promise<{ userEmail?: string } | void> {
  const result = checkoutSessionMetadataSchema.safeParse(
    checkoutSession.metadata,
  );

  if (!result.success) {
    throw new Error("Invalid metadata in checkout session");
  }

  const { userId } = result.data;

  // Verify payment was successful before granting access
  if (checkoutSession.payment_status !== "paid") {
    throw new Error("Payment was not completed successfully");
  }

  // Verify the session includes the expected product (for webhook processing)
  if (options?.verifyPrice) {
    verifyCheckoutSessionPrice(checkoutSession);
  }

  try {
    // Fetch user to check current role
    const user = await prisma.user.findUniqueOrThrow({
      where: { id: userId },
      select: { role: true, email: true },
    });

    // Only update if not already premium (idempotent)
    if (user.role === "PREMIUM") {
      return;
    }

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

    // Return email if caller wants to send confirmation
    if (options?.sendEmail) {
      return { userEmail: user.email };
    }
  } catch {
    throw new Error("Failed to purchase course");
  }
}

export async function GET(req: NextRequest) {
  const sessionId = req.nextUrl.searchParams.get("session_id");

  if (!sessionId) {
    redirect("/acing-aufnahmetest/purchase/error");
  }

  let redirectUrl: string;
  try {
    // Get authenticated user from session
    const { isAuthenticated, userId: authenticatedUserId } =
      await verifySession();

    if (!isAuthenticated) {
      throw new Error("User is not authenticated");
    }

    const checkoutSession = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["line_items"],
    });

    // Verify metadata user matches authenticated user (security check)
    const metadataResult = checkoutSessionMetadataSchema.safeParse(
      checkoutSession.metadata,
    );
    if (!metadataResult.success) {
      throw new Error("Invalid metadata in checkout session");
    }

    if (metadataResult.data.userId !== authenticatedUserId) {
      throw new Error("Checkout session does not belong to authenticated user");
    }

    const checkoutResult = await processStripeCheckout(checkoutSession, {
      verifyPrice: true,
      sendEmail: true,
    });

    if (checkoutResult?.userEmail) {
      try {
        await resend.emails.send({
          from: `Acing Aufnahmetest <onboarding@${env.EMAIL_DOMAIN}>`,
          to: checkoutResult.userEmail,
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
        console.error("Failed to send purchase confirmation email on GET:", {
          error: error instanceof Error ? error.message : String(error),
          sessionId,
        });
      }
    }

    redirectUrl = "/acing-aufnahmetest/purchase/success";
  } catch {
    redirectUrl = "/acing-aufnahmetest/purchase/error";
  }

  return NextResponse.redirect(new URL(redirectUrl, req.url));
}

export async function POST(req: NextRequest) {
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
        await processStripeCheckout(event.data.object, {
          verifyPrice: true,
        });
      } catch (error) {
        console.error("Stripe webhook error:", {
          error: error instanceof Error ? error.message : String(error),
          eventType: event.type,
          eventId: event.id,
        });
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
