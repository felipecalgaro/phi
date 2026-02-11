'use client'

import { getClientSessionSecret } from '@/actions/acing-aufnahmetest/get-client-session-secret'
import { EmbeddedCheckoutProvider, EmbeddedCheckout } from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js';

export function StripeCheckoutForm() {
  const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

  return (
    <EmbeddedCheckoutProvider stripe={stripePromise} options={{
      fetchClientSecret: getClientSessionSecret
    }}>
      <EmbeddedCheckout />
    </EmbeddedCheckoutProvider>
  )
}