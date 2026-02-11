'use client'

import { useQueryClient } from '@tanstack/react-query'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import Link from 'next/link'

export function PurchaseSuccessRedirectButton() {
  const queryClient = useQueryClient()
  queryClient.invalidateQueries({ queryKey: ['user-session'] })

  return (
    <Link href='/acing-aufnahmetest/lessons' className={cn(buttonVariants(), 'w-full bg-black hover:bg-black/90 text-white py-5')}>Go to Lessons</Link>
  )
}