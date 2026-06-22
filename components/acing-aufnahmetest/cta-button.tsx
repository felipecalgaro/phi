'use client'

import { Button } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'
import { registerAnalyticsEvent } from '@/lib/google-analytics'
import { useRouter } from 'next/navigation'

type CTAButtonProps = {
  className?: string;
}

export function CTAButton({ className }: CTAButtonProps = {}) {
  const router = useRouter()

  return (
    <Button
      onClick={(e) => {
        e.preventDefault()
        registerAnalyticsEvent('buy_course_click')
        router.push('/acing-aufnahmetest/purchase')
      }}
      variant="gold"
      className={className}
    >
      Buy the course
      <ArrowRight className="ml-2 inline-block size-6" />
    </Button>
  )
}
