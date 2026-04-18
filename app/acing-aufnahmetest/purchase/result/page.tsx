import { StripeCheckoutResult } from '@/components/acing-aufnahmetest/stripe-checkout-result';
import { stripe } from "@/lib/stripe";

interface CheckoutResultPageProps {
  searchParams: Promise<{ session_id?: string }>;
}

export default async function CheckoutResultPage({
  searchParams,
}: CheckoutResultPageProps) {
  const { session_id: sessionId } = await searchParams;

  if (!sessionId) {
    throw new Error("Missing session_id in query parameters");
  }

  const checkoutSession = await stripe.checkout.sessions.retrieve(sessionId, {
    expand: ["line_items"],
  });

  return (
    <div className='flex absolute top-1/2 -translate-y-1/2 justify-center items-center flex-1 max-w-120'>
      <StripeCheckoutResult result={checkoutSession.payment_status === 'paid' ? 'SUCCESS' : 'FAILURE'} sessionId={sessionId} />
    </div>
  )
}