import { StripeCheckoutSuccess } from '@/components/acing-aufnahmetest/stripe-checkout-success';
import { buttonVariants } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { env } from '@/lib/env';
import { stripe } from "@/lib/stripe";
import { cn } from '@/lib/utils';
import { XCircleIcon } from 'lucide-react';
import Link from 'next/link';

interface CheckoutReturnPageProps {
  searchParams: Promise<{ session_id?: string }>;
}

export default async function CheckoutReturnPage({
  searchParams,
}: CheckoutReturnPageProps) {
  const { session_id: sessionId } = await searchParams;
  const supportEmail = `support@${env.EMAIL_DOMAIN}`;

  if (!sessionId) {
    throw new Error("Missing session_id in query parameters");
  }

  const checkoutSession = await stripe.checkout.sessions.retrieve(sessionId, {
    expand: ["line_items"],
  });

  return (
    <div className='flex absolute top-1/2 -translate-y-1/2 justify-center items-center flex-1 max-w-120'>
      {checkoutSession.payment_status === 'paid' ? (
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
      )}
    </div>
  )
}