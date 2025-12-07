'use client'

import { registerAnalyticsEvent } from '@/lib/google-analytics'
import { Button } from './ui/button'
import { ArrowRight } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { ReactNode } from 'react'

interface ApplicationButtonProps {
  className?: string
  children?: ReactNode
}

export function ApplicationButton({ className, children }: ApplicationButtonProps) {
  const router = useRouter()

  return (
    <Button
      variant="gold"
      onClick={() => {
        registerAnalyticsEvent('apply_now_click')
        router.push(process.env.NEXT_PUBLIC_APPLICATION_FORM_URL || "#")
      }}
      className={cn("sm:text-xl text-base font-bold shadow-button hover:shadow-glow transition-all rounded-xl sm:py-8 py-7 sm:w-56 w-44 cursor-pointer", className)}
    >
      {children ? (
        children
      ) : (
        <>
          Apply Now
          <ArrowRight className="sm:ml-4 ml-2 inline-block sm:size-8 size-6" />
        </>
      )}
    </Button>
  )
}