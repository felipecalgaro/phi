'use client'

import { sendMagicLinkEmail } from '../../actions/acing-aufnahmetest/send-magic-link-email';
import { toast } from 'sonner';
import z from 'zod';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { useState } from 'react';
import { useFormStatus } from 'react-dom';
import { registerAnalyticsEvent } from '@/lib/google-analytics';

function LoginSubmitButton() {
  const { pending } = useFormStatus()

  return (
    <Button type='submit' disabled={pending} className='px-14 py-5 rounded-sm cursor-pointer w-full'>
      {pending ? 'Sending...' : 'Login'}
    </Button>
  )
}

export function LoginForm() {
  const [error, setError] = useState<string>()

  async function handleLogin(data: FormData) {
    registerAnalyticsEvent('send_magic_link_click')

    const result = z.email('Please provide a valid e-mail').safeParse(data.get('email'))

    if (!result.success) {
      const { message } = result.error.issues[0]

      setError(message)
      toast.error(message)

      return
    }

    const response = await sendMagicLinkEmail({ email: result.data })

    if (!response.success) {
      toast.error(response.error)

      return
    }

    setError(undefined)
    toast.success('Check your e-mail!')
  }

  return (
    <form action={handleLogin} className='flex justify-between items-center flex-col w-full'>
      <div className='flex justify-center items-start flex-col w-full gap-2'>
        <Label htmlFor='email' className='ml-2 text-base'>E-mail</Label>
        <Input placeholder="Type your e-mail here" className='w-full p-6 text-sm' name='email' />
        <div className='min-h-5'>
          {error && (
            <p className='text-red-500 text-sm whitespace-nowrap'>{error}</p>
          )}
        </div>
      </div>
      <LoginSubmitButton />
    </form>
  )
}