'use client'

import { registerAnalyticsEvent } from '@/lib/google-analytics'
import { Button } from './ui/button'
import { ArrowRight } from 'lucide-react'
import { useRouter } from 'next/navigation'

export function ApplicationButton() {
  const router = useRouter()

  return (
    <Button
      onClick={() => {
        registerAnalyticsEvent('apply_now_click')
        router.push("https://docs.google.com/forms/d/e/1FAIpQLSfHAg5p9clAxRhXVQg98FL6Frb7ZFZuxfRPjgM3z7VTl2T1Ng/viewform")
      }}
      className="sm:text-xl text-lg font-bold shadow-button hover:shadow-glow transition-all bg-orange-500 hover:bg-orange-600 text-white rounded-xl py-8 sm:w-56 w-48 cursor-pointer"
    >
      Apply Now
      <ArrowRight className="ml-4 inline-block size-8" />
    </Button>
  )
}