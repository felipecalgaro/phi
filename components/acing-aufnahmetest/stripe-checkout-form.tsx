'use client'

import { getClientSessionSecret } from '@/actions/acing-aufnahmetest/get-client-session-secret'
import { EmbeddedCheckoutProvider, EmbeddedCheckout } from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js';
import { useEffect } from 'react';
import { registerAnalyticsEvent } from '@/lib/google-analytics';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

export function StripeCheckoutForm() {
  useEffect(() => {
    registerAnalyticsEvent('stripe_checkout_render')
  }, [])

  return (
    <EmbeddedCheckoutProvider stripe={stripePromise} options={{
      fetchClientSecret: getClientSessionSecret
    }}>
      <EmbeddedCheckout />
    </EmbeddedCheckoutProvider>
  )
}