"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { sendNPS } from '@/actions/exercises/send-nps'

export function NPSDialog() {
  const [selectedScore, setSelectedScore] = useState<number | null>(null)
  const [submitted, setSubmitted] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  async function handleSubmit() {
    if (selectedScore !== null) {
      await sendNPS({ score: selectedScore })

      setSubmitted(true)
      setTimeout(() => {
        setSelectedScore(null)
        setSubmitted(false)
        setIsDialogOpen(false)
      }, 1500)
    }
  }

  useEffect(() => {
    const exercisesViewed = JSON.parse(localStorage.getItem("exercisesViewed") || '[]')
    const shouldOpen = exercisesViewed.length === 2 && localStorage.getItem("alreadySubmittedNPSScore") !== 'true'

    if (shouldOpen && !submitted) {
      setIsDialogOpen(true)
      localStorage.setItem("alreadySubmittedNPSScore", 'true')
    }
  }, [submitted])

  return (
    <Dialog open={isDialogOpen} onOpenChange={() => setIsDialogOpen(false)}>
      <DialogContent className="max-w-md w-11/12">
        <DialogHeader>
          <DialogTitle>How satisfied are you?</DialogTitle>
          <DialogDescription>Your feedback helps us improve your experience</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-6 py-4">
          {!submitted ? (
            <>
              <div className="flex justify-center gap-2 flex-wrap">
                {[1, 2, 3, 4, 5].map((score) => (
                  <button
                    key={score}
                    onClick={() => setSelectedScore(score)}
                    className={`flex size-16 items-center justify-center rounded-lg font-semibold transition-all ${selectedScore === score
                      ? "border border-primary text-primary scale-110 shadow-lg"
                      : "text-muted-foreground border border-muted-foreground/50 hover:bg-accent hover:text-accent-foreground cursor-pointer"
                      }`}
                  >
                    {score}
                  </button>
                ))}
              </div>

              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)} className="flex-1 bg-transparent">
                  Cancel
                </Button>
                <Button onClick={handleSubmit} disabled={selectedScore === null} className="flex-1 text-white bg-sky-400 hover:bg-sky-500">
                  Submit
                </Button>
              </div>
            </>
          ) : (
            <div className="text-center py-2">
              <p className="text-sm font-medium text-muted-foreground">✓ Thank you for your feedback!</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
