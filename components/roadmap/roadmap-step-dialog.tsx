"use client"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { STEPS } from "@/data/roadmap/steps"
import { registerAnalyticsEvent } from "@/lib/google-analytics"
import { cn } from "@/lib/utils"

type RoadmapStepKey = (typeof STEPS)[number]["key"]

type RoadmapStepDialogProps = {
  alignLeft: boolean
  required: boolean
  stepNumber: number
  stepKey: RoadmapStepKey
}

export function RoadmapStepDialog({
  alignLeft,
  required,
  stepNumber,
  stepKey,
}: RoadmapStepDialogProps) {
  const step = STEPS.find((item) => item.key === stepKey)

  if (!step) {
    return null
  }

  const Icon = step.icon

  return (
    <Dialog
      onOpenChange={(open) => {
        if (!open) {
          return
        }

        registerAnalyticsEvent("roadmap_step_opened", {
          step_key: stepKey,
          required,
        })
      }}
    >
      <DialogTrigger asChild>
        <div className={cn('relative flex md:items-center gap-4 md:gap-0', alignLeft ? "md:flex-row" : "md:flex-row-reverse")}>
          <div className="md:w-1/2 w-full md:px-10 pl-20">
            <button
              className={cn('group w-full text-left rounded-3xl p-6 transition-all', {
                'bg-background/40 border border-dashed border-border opacity-70 hover:opacity-100': !required,
                'bg-card border border-border hover:shadow-(--shadow-accent) hover:-translate-y-0.5': required
              })}
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-medium text-muted-foreground tracking-wide uppercase">
                  Step {stepNumber}
                </span>
                {!required && (
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground bg-muted-foreground/10 px-2 py-0.5 rounded-full">
                    Not required
                  </span>
                )}
              </div>
              <h3 className={`text-2xl font-semibold mb-2 ${!required ? "text-muted-foreground" : "group-hover:text-gradient-accent"}`}>{step.title}</h3>
              <p className="text-sm text-muted-foreground">
                Click to see what to do here.
              </p>
            </button>
          </div>
          <div className="absolute left-8 md:left-1/2 md:-translate-x-1/2 top-6 md:top-1/2 md:-translate-y-1/2">
            <div
              className={`w-16 h-16 rounded-full flex items-center justify-center border-4 border-background shadow-lg ${!required ? "opacity-60 grayscale" : ""}`}
              style={{ background: step.color }}
            >
              <Icon className="w-7 h-7 text-foreground" />
            </div>
          </div>
          <div className="hidden md:block md:w-1/2" />
        </div>
      </DialogTrigger>
      <DialogContent className="max-h-132 max-w-2xl overflow-hidden rounded-3xl p-0">
        <div className="max-h-132 overflow-y-auto p-6 pr-8">
          <DialogHeader>
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-3" style={{ background: step.color }}>
              <Icon className="w-7 h-7 text-foreground" />
            </div>
            <DialogTitle className="text-2xl font-semibold">{step.title}</DialogTitle>
            <DialogDescription className="sr-only">
              Details for {step.title}
            </DialogDescription>
            <div className="space-y-4 pt-2 text-base leading-relaxed text-muted-foreground [&_a]:text-foreground [&_a]:font-medium [&_b]:text-foreground [&_em]:text-foreground [&_li]:pl-1 [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-5">
              {step.description}
            </div>
          </DialogHeader>
        </div>
      </DialogContent>
    </Dialog>
  )
}
