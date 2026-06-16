'use client'

import { useEffect } from 'react'
import confetti from 'canvas-confetti'

const STORAGE_KEY = 'roadmap-confetti-seen'

export function ConfettiOnFirstVisit() {
  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    try {
      if (window.localStorage.getItem(STORAGE_KEY)) {
        return
      }

      window.localStorage.setItem(STORAGE_KEY, 'true')
    } catch {
      return
    }

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return
    }

    window.setTimeout(() => {
      confetti({
        particleCount: 140,
        spread: 80,
        startVelocity: 32,
        origin: { y: 0.72 },
      })

      window.setTimeout(() => {
        confetti({
          particleCount: 90,
          spread: 110,
          startVelocity: 24,
          origin: { y: 0.68 },
        })
      }, 180)
    }, 50)
  }, [])

  return null
}