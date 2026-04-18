'use client'

import { cn } from '@/lib/utils';
import { XCircleIcon, Link } from 'lucide-react';
import { buttonVariants } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { StripeCheckoutSuccess } from './stripe-checkout-success'
import { useEffect } from 'react';
import { registerAnalyticsEvent } from '@/lib/google-analytics';

interface StripeCheckoutResultProps {
  result: 'SUCCESS' | 'FAILURE';
  sessionId: string;
}

export function StripeCheckoutResult({ result, sessionId }: StripeCheckoutResultProps) {
  const supportEmail = `onboarding@${process.env.NEXT_PUBLIC_EMAIL_DOMAIN}`;

  useEffect(() => {
    const eventName = result === 'SUCCESS' ? 'checkout_success' : 'checkout_failure';
    registerAnalyticsEvent(eventName);
  }, [result]);

  return result === 'SUCCESS' ? (
    <StripeCheckoutSuccess sessionId={sessionId} />
  ) : (
    <Card className='justify-between py-8 gap-12'>
      <CardHeader>
        <div className='flex justify-center items-center gap-4 w-full'>
          <XCircleIcon className='xs:size-10 size-6 text-red-600' />
          <CardTitle className='text-3xl'>Oh-oh</CardTitle>
        </div>
      </CardHeader>
      <CardContent className='h-full grow justify-between flex-col flex gap-10'>
        <CardDescription className='text-center'>We couldn&apos;t process your payment. This may have happened due to a declined card, network issue, or an unexpected error.</CardDescription>
        <div className='flex flex-col gap-4'>
          <Link href='/acing-aufnahmetest/purchase' className={cn(buttonVariants(), 'bg-black hover:bg-black/90 text-white py-5')}>Retry Purchase</Link>
          <CardDescription className='text-center text-xs'>If the problem persists, please contact us at{' '}
            <Link href={`mailto:${supportEmail}`} className='text-blue-600 hover:underline'>
              {supportEmail}
            </Link>
          </CardDescription>
        </div>
      </CardContent>
    </Card>
  )
}