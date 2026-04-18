"use client"

import { useEffect } from "react"
import { usePathname, useSearchParams } from "next/navigation"
import { registerPageView } from '../lib/google-analytics'

export function AnalyticsPageTracker() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    if (pathname) {
      const queryString = searchParams.toString()
      const url = queryString ? `${pathname}?${queryString}` : pathname
      registerPageView(url)
    }
  }, [pathname, searchParams])

  return null
}
