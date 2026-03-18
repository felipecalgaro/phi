import { buttonVariants } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { XCircleIcon } from 'lucide-react';
import Link from 'next/link';
import { env } from '@/lib/env';

export default async function PaymentError() {
  const supportEmail = `support@${env.EMAIL_DOMAIN}`;
  return (
    <div className='flex absolute top-1/2 -translate-y-1/2 justify-center items-center flex-1 max-w-120'>
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
              <a href={`mailto:${supportEmail}`} className='text-blue-600 hover:underline'>
                {supportEmail}
              </a>
            </CardDescription>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}