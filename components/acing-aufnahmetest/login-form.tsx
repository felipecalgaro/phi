'use client'

import { sendMagicLinkEmail } from '../../actions/acing-aufnahmetest/send-magic-link-email';
import { toast } from 'sonner';
import z from 'zod';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { useState } from 'react';

export function LoginForm() {
  const [error, setError] = useState<string>()
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleLogin(data: FormData) {
    setIsSubmitting(true)
    const result = z.email('Please provide a valid e-mail').safeParse(data.get('email'))

    if (!result.success) {
      const { message } = result.error.issues[0]

      setError(message)
      toast.error(message)
      setIsSubmitting(false)

      return
    }

    const response = await sendMagicLinkEmail({ email: result.data })
    setIsSubmitting(false)

    if (response && !response.success) {
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
      <Button type='submit' disabled={isSubmitting} className='px-14 py-5 rounded-sm cursor-pointer w-full'>Login</Button>
    </form>
  )
}