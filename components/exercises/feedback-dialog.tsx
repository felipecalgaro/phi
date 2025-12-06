'use client'

import { sendFeedback } from '@/actions/exercises/send-feedback'
import { MessageCircleMore } from 'lucide-react'
import { Button } from '../ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog'
import { Textarea } from '../ui/textarea'
import { useActionState, useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { registerAnalyticsEvent } from '@/lib/google-analytics'
import { usePathname } from 'next/navigation'

export function FeedbackDialog() {
  const path = usePathname()
  const [wasFeedbackSent, formAction, isPending] = useActionState(sendFeedback, false)
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    if (wasFeedbackSent) {
      setIsOpen(false)
      toast.success('Feedback successfully sent!')
    }
  }, [wasFeedbackSent])

  return (
    <Dialog open={isOpen} onOpenChange={(open => {
      if (open) {
        registerAnalyticsEvent('feedback_dialog_opened', {
          path
        })
      }

      setIsOpen(open)
    })}>
      <DialogTrigger asChild>
        <Button className='fixed text-white sm:bottom-12 bottom-6 sm:right-12 right-6 sm:w-40 w-32 sm:h-12 h-10 rounded-full bg-sky-400 hover:bg-sky-500 sm:text-base text-sm shadow-lg shadow-black/20'>
          <MessageCircleMore className='sm:size-5 size-4' />
          Feedback
        </Button>
      </DialogTrigger>
      <DialogContent className='gap-0 h-72'>
        <DialogHeader className='flex justify-start items-start flex-col gap-4 mb-8'>
          <DialogTitle>Feedback</DialogTitle>
          <DialogDescription>
            Any suggestions or problems? Please write them down.
          </DialogDescription>
        </DialogHeader>
        <form action={(data) => {
          registerAnalyticsEvent('feedback_submitted', {
            path
          })

          formAction(data)
        }} className='flex flex-col gap-4'>
          <Textarea name='feedback' className='min-h-24' placeholder='Write your feedback here' />
          <Button type='submit' className={cn('bg-sky-400 hover:bg-sky-500 w-full text-white', isPending && 'opacity-50 cursor-default')} disabled={isPending}>
            Send
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}