'use client'

import { useGetClientSession } from '@/hooks/use-get-client-session'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { buttonVariants } from '../ui/button'
import { ArrowRight } from 'lucide-react'
import { CTAButton } from './cta-button'

type AccessCourseButtonProps = {
  className?: string;
}

export function AccessCourseButton({ className }: AccessCourseButtonProps = {}) {
  const { data, isPending, isError } = useGetClientSession()

  const buttonClassNames = cn(buttonVariants({ variant: "gold" }), "shadow-button hover:shadow-glow transition-all rounded-xl sm:py-8 py-7 has-[>svg]:px-6 cursor-pointer", className)
  const iconClassNames = "inline-block size-6"

  if (isPending) {
    return (
      <Link
        href="#"
        className={buttonClassNames}
      >
        Buy the course
        <ArrowRight className={iconClassNames} />
      </Link>
    )
  }

  if (isError) {
    return <CTAButton className={cn(buttonClassNames, className)} />
  }

  if (!data.isAuthenticated) {
    return (
      <Link
        href="/login?redirect=purchase"
        className={buttonClassNames}
      >
        Buy the course
        <ArrowRight className={iconClassNames} />
      </Link>
    )
  }

  if (data.userRole === 'BASIC') {
    return <CTAButton className={cn(buttonClassNames, className)} />
  }

  return (
    <Link
      href="/acing-aufnahmetest/lessons"
      className={buttonClassNames}
    >
      Access course
      <ArrowRight className={iconClassNames} />
    </Link>
  )
}
