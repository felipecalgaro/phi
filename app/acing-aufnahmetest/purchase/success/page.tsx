import { PurchaseSuccessRedirectButton } from '@/components/acing-aufnahmetest/purchase-success-redirect-button';
import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card';
import { CheckCircle2 } from 'lucide-react';

export default async function PaymentSuccess() {
  return (
    <div className='flex absolute top-1/2 -translate-y-1/2 justify-center items-center flex-1 max-w-120'>
      <Card className='justify-between py-8 gap-12'>
        <CardHeader>
          <div className='flex justify-center items-center gap-4 w-full'>
            <CheckCircle2 className='xs:size-10 size-6 text-green-600' />
            <h1 className='font-bold xs:text-3xl text-xl'>Congratulations!</h1>
          </div>
        </CardHeader>
        <CardContent className='h-full grow justify-between flex-col flex gap-10'>
          <CardDescription className='text-center'>Welcome to <span className='font-semibold'>Acing Aufnahmetest</span>! You now have full access to the course.</CardDescription>
          <PurchaseSuccessRedirectButton />
        </CardContent>
      </Card>
    </div>
  )
}