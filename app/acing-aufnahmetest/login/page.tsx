import { LoginForm } from '@/components/acing-aufnahmetest/login-form';
import { Skeleton } from '@/components/ui/skeleton';
import { Suspense } from 'react';

export default async function Login() {
  return (
    <div className='h-screen flex justify-center items-center xs:px-12 px-4'>
      <div className='flex flex-col max-w-124 w-full max-[360px]:px-6 px-10 bg-card text-card-foreground gap-6 rounded-xl border py-10'>
        <h1 className='xs:text-5xl text-4xl font-bold text-center mb-12'>Welcome</h1>
        <Suspense fallback={<Skeleton className='w-full h-44' />}>
          <LoginForm />
        </Suspense>
        <div className='w-full bg-gray-100 px-7 py-4 rounded-xs border border-gray-200'>
          <p className='text-muted-foreground text-sm'>We&apos;ll email you a magic link for a password-free login</p>
        </div>
      </div>
    </div>
  )
}