'use client'

import { useGetClientSession } from '@/hooks/use-get-client-session'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { buttonVariants } from '../ui/button'
import { ArrowRight } from 'lucide-react'
import { CTAButton } from './cta-button'

export function AccessCourseButton() {
  const { data, isPending, isError } = useGetClientSession()

  if (isPending) {
    return (
      <Link
        href="#"
        className={cn(buttonVariants({ variant: "gold" }), "sm:text-xl text-base font-bold shadow-button hover:shadow-glow transition-all rounded-xl sm:py-8 py-7 sm:w-72 w-56 cursor-pointer")}
      >
        Buy the course
        <ArrowRight className="sm:ml-4 ml-2 inline-block sm:size-8 size-6" />
      </Link>
    )
  }

  if (isError || !data.isAuthenticated || data.userRole === 'BASIC') {
    return <CTAButton />
  }

  return (
    <Link
      href="/acing-aufnahmetest/lessons"
      className={cn(buttonVariants({ variant: "gold" }), "sm:text-xl text-base font-bold shadow-button hover:shadow-glow transition-all rounded-xl sm:py-8 py-7 sm:w-72 w-56 cursor-pointer")}
    >
      Access course
      <ArrowRight className="sm:ml-4 ml-2 inline-block sm:size-8 size-6" />
    </Link>
  )
}