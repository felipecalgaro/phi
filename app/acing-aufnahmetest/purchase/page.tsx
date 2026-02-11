import { StripeCheckoutForm } from '@/components/acing-aufnahmetest/stripe-checkout-form';

export default async function Payment() {
  return (
    <div className='min-h-screen flex justify-start items-center flex-col xs:px-6 px-3 gap-16 py-20'>
      <div className='flex justify-start items-center xs:px-12 px-2 pb-12 flex-col xs:gap-20 gap-16 border border-border rounded-sm max-w-200 w-full'>
        <StripeCheckoutForm />
      </div>
    </div>
  );
}