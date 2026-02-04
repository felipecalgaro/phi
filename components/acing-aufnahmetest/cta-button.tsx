'use client'

import { Button } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { FormEvent, useEffect, useRef, useState } from 'react'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { sendEmail } from '@/actions/acing-aufnahmetest/send-email'
import { registerAnalyticsEvent } from '@/lib/google-analytics'

// fetch no /api/user-session com usequery, enquanto nao pega os dados mostrar como se o user fosse nao premium, pq provavlemnte nao eh

export function CTAButton() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [email, setEmail] = useState('')
  const [isSuccess, setIsSuccess] = useState(false)
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLButtonElement | null>(null);
  const fired = useRef(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsSubmitting(true)

    registerAnalyticsEvent('notify_me_submit')

    try {
      await sendEmail({ email })
      setIsSuccess(true)
    } finally {
      setIsSubmitting(false)
    }
  }

  useEffect(() => {
    if (!ref.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !fired.current) {
          fired.current = true;

          registerAnalyticsEvent('buy_course_view');

          observer.disconnect();
        }
      },
      {
        threshold: 1.0,
      }
    );

    observer.observe(ref.current);

    return () => observer.disconnect();
  }, []);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          ref={ref}
          onClick={(e) => {
            e.preventDefault()
            registerAnalyticsEvent('buy_course_click')
            setOpen(true)
          }}
          variant="gold"
          className="sm:text-xl text-base font-bold shadow-button hover:shadow-glow transition-all rounded-xl sm:py-8 py-7 sm:w-72 w-56 cursor-pointer"
        >
          Buy the course
          <ArrowRight className="sm:ml-4 ml-2 inline-block sm:size-8 size-6" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md bg-foreground/80 backdrop-blur-lg text-white">
        <DialogHeader>
          <DialogTitle>🚧 Course Coming Soon</DialogTitle>
          <DialogDescription>This course is currently under development and will be launched soon.</DialogDescription>
        </DialogHeader>
        {!isSuccess ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Get notified when we launch</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
              />
            </div>
            <Button type="submit" className="w-full" variant='gold' disabled={isSubmitting}>
              {isSubmitting ? "Submitting..." : "Notify Me"}
            </Button>
          </form>
        ) : (
          <div className="rounded-lg bg-green-950/50 p-4 text-center text-green-600">
            <p className="font-medium">Thank you!</p>
            <p className="text-sm">We&apos;ll notify you when the course launches.</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}