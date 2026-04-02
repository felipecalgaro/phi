'use client'

import { CheckCircle2, XCircleIcon } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { buttonVariants } from '../ui/button'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import z from 'zod'
import { getResponseDataSchema } from '@/utils/get-response-data-object'

interface StripeCheckoutSuccessProps {
  sessionId: string;
}

const fulfillPremiumSessionSchema = getResponseDataSchema(z.null());

export function StripeCheckoutSuccess({ sessionId }: StripeCheckoutSuccessProps) {
  const queryClient = useQueryClient()

  const { isError } = useQuery({
    queryKey: ['fulfill-premium-session', sessionId],
    queryFn: async () => {
      let parsedResponse: z.infer<typeof fulfillPremiumSessionSchema>;
      try {
        const response = await fetch(`/api/fulfill-premium-session`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ sessionId }),
        });
        parsedResponse = fulfillPremiumSessionSchema.parse(await response.json());
      } catch {
        throw new Error("Internal server error");
      }

      if (!parsedResponse.success) {
        throw new Error(parsedResponse.error);
      }

      queryClient.invalidateQueries({ queryKey: ['user-session'] })

      return parsedResponse.data;
    },
    enabled: !!sessionId,
  })

  if (isError) {
    return (
      <Card className='justify-between py-8 gap-12'>
        <CardHeader>
          <div className='flex justify-center items-center gap-4 w-full'>
            <XCircleIcon className='xs:size-10 size-6 text-red-600' />
            <CardTitle className='text-3xl'>Unexpected error</CardTitle>
          </div>
        </CardHeader>
        <CardContent className='h-full grow justify-between flex-col flex gap-10'>
          <CardDescription className='text-center'>We couldn&apos;t verify your payment right now. Please refresh in a moment or contact support if the issue persists.</CardDescription>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className='justify-between py-8 gap-12'>
      <CardHeader>
        <div className='flex justify-center items-center gap-4 w-full'>
          <CheckCircle2 className='xs:size-10 size-6 text-green-600' />
          <CardTitle className='font-bold xs:text-3xl text-xl'>Congratulations!</CardTitle>
        </div>
      </CardHeader>
      <CardContent className='h-full grow justify-between flex-col flex gap-10'>
        <CardDescription className='text-center'>Welcome to <span className='font-semibold'>Acing Aufnahmetest</span>! You now have full access to the course.</CardDescription>
        <Link href='/acing-aufnahmetest/lessons' className={cn(buttonVariants(), 'w-full bg-black hover:bg-black/90 text-white py-5')}>Go to Lessons</Link>
      </CardContent>
    </Card>
  )
}