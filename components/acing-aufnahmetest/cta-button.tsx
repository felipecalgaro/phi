'use client'

import { Button } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'
import { registerAnalyticsEvent } from '@/lib/google-analytics'
import { useRouter } from 'next/navigation'

export function CTAButton() {
  const router = useRouter()

  return (
    <Button
      onClick={(e) => {
        e.preventDefault()
        registerAnalyticsEvent('buy_course_click')
        router.push('/acing-aufnahmetest/purchase')
      }}
      variant="gold"
      className="sm:text-xl text-base font-bold shadow-button hover:shadow-glow transition-all rounded-xl sm:py-8 py-7 sm:w-72 w-56 cursor-pointer"
    >
      Buy the course
      <ArrowRight className="sm:ml-4 ml-2 inline-block sm:size-8 size-6" />
    </Button>
  )
}