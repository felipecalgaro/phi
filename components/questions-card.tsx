'use client'

import { sendMagicLinkEmail } from "@/actions/acing-aufnahmetest/send-magic-link-email"
import { MultiCombobox, type MultiComboboxOption } from "@/components/multi-combobox"
import { Button, buttonVariants } from "@/components/ui/button"
import COUNTRIES from "@/data/countries.json"
import STUDIENKOLLEGS from "@/data/studienkollegs.json"
import { Checkbox } from "./ui/checkbox"
import { Combobox, ComboboxContent, ComboboxEmpty, ComboboxInput, ComboboxItem, ComboboxList } from './ui/combobox'
import { InputGroup, InputGroupAddon, InputGroupInput } from './ui/input-group'
import { Label } from "./ui/label"
import { Skeleton } from "./ui/skeleton"
import { useGetClientSession } from "@/hooks/use-get-client-session"
import { cn } from "@/lib/utils"
import { useQuery } from "@tanstack/react-query"
import { ArrowLeft, ArrowRight, MailIcon } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { toast } from "sonner"
import { z } from "zod"
import { getResponseDataSchema } from '@/utils/get-response-data-object'
import { updateUserWithRoadmapAnswers } from '@/actions/roadmap/update-user-with-roadmap-answers'

const formDataSchema = z.object({
  countryOfHighschool: z.string().min(1),
  citizenships: z.array(z.string()).min(1),
  plannedStudienkollegs: z.array(z.uuid()),
  plannedAttendance: z.object({
    year: z.string().min(1),
    semester: z.union([z.enum(["Winter", "Summer"]), z.string().length(0)]),
  }),
  email: z.email(),
  subscribedToMarketing: z.boolean(),
})

type FormData = z.infer<typeof formDataSchema>

const roadmapAnswersSchema = z.object({
  countryOfHighschool: z.string().min(1),
  citizenships: z.array(z.string()).min(1),
  plannedStudienkollegs: z.array(z.uuid()),
  plannedAttendance: z.object({
    year: z.string().min(1),
    semester: z.enum(["WINTER", "SUMMER"]),
  }),
  subscribedToMarketing: z.boolean(),
})

type RoadmapAnswers = z.infer<typeof roadmapAnswersSchema>

const roadmapStatusSchema = getResponseDataSchema(
  z.object({
    hasRoadmapGenerated: z.boolean(),
  })
)

const COUNTRY_OPTIONS: MultiComboboxOption[] = COUNTRIES.map((country) => ({
  label: country,
  value: country,
}))

const STUDIENKOLLEG_OPTIONS: MultiComboboxOption[] = STUDIENKOLLEGS.map((item) => ({
  label: item.name,
  value: item.id,
}))

export function QuestionsCard() {
  const [step, setStep] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [data, setData] = useState<FormData>(() => ({
    countryOfHighschool: "",
    citizenships: [],
    plannedStudienkollegs: [],
    plannedAttendance: { year: "", semester: "" },
    email: "",
    subscribedToMarketing: false,
  } as unknown as FormData))

  const { data: roadmapStatus, isPending: isRoadmapStatusPending } = useQuery({
    queryKey: ["roadmap-status"],
    queryFn: async () => {
      let parsedResponse: z.infer<typeof roadmapStatusSchema>

      try {
        const response = await fetch("/api/roadmap-status")
        parsedResponse = roadmapStatusSchema.parse(await response.json())
      } catch {
        throw new Error("Internal server error")
      }

      if (!parsedResponse.success) {
        throw new Error(parsedResponse.error);
      }

      return parsedResponse.data
    },
    staleTime: Infinity,
  })

  const hasRoadmapGenerated = roadmapStatus?.hasRoadmapGenerated === true
  const shouldFetchSession =
    roadmapStatus?.hasRoadmapGenerated === false ||
    (roadmapStatus?.hasRoadmapGenerated === undefined && !isRoadmapStatusPending)

  const { data: session } = useGetClientSession({ enabled: shouldFetchSession })

  if (isRoadmapStatusPending) {
    return (
      <div className="w-full max-w-2xl xl:max-w-lg rounded-3xl border border-border bg-card p-8 shadow-(--shadow-accent) md:p-10">
        <div className="space-y-5">
          <Skeleton className="h-4 w-24 rounded-full" />
          <div className="space-y-3">
            <Skeleton className="h-8 w-4/5" />
            <Skeleton className="h-6 w-full max-w-md" />
          </div>
          <Skeleton className="h-14 w-full rounded-xl" />
          <div className="flex justify-between gap-4 pt-4">
            <Skeleton className="h-12 w-24 rounded-full" />
            <Skeleton className="h-12 w-32 rounded-full" />
          </div>
        </div>
      </div>
    )
  }

  if (hasRoadmapGenerated) {
    return (
      <div className="w-full max-w-2xl xl:max-w-lg rounded-3xl border border-border bg-card p-8 shadow-(--shadow-accent) md:p-10">
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold md:text-3xl">
            Congratulations! Your roadmap is ready 🎉
          </h2>
          <p className="text-sm leading-6 text-muted-foreground">
            Open your roadmap page to review your personalized plan and continue where you left off.
          </p>
        </div>

        <div className="mt-8">
          <Link
            href="/roadmap"
            className={cn(buttonVariants({ size: "lg" }), "h-12 rounded-full bg-foreground px-6 text-background hover:bg-foreground/90")}
          >
            Go to roadmap
            <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </div>
      </div>
    )
  }

  const shouldShowEmailQuestion = session?.isAuthenticated !== true

  const baseQuestions = [
    { key: "countryOfHighschool", label: "Where did you (or will you) complete high school?" },
    { key: "citizenships", label: "Which citizenships(s) do you have?" },
    {
      key: "plannedStudienkollegs",
      label: "Which Studienkollegs do you want to apply to? (If you don't know yet, just skip this question)",
    },
    { key: "plannedAttendance", label: "When do you plan to attend Studienkolleg?" },
  ] as const

  const emailQuestion = {
    key: "email",
    label: "Save your roadmap to your account.",
  } as const

  const questions = shouldShowEmailQuestion ? [...baseQuestions, emailQuestion] : baseQuestions

  const activeStep = Math.min(step, questions.length - 1)

  const currentQuestion = questions[activeStep]
  const currentAnswer = data[currentQuestion.key]
  let canContinue = formDataSchema.shape[currentQuestion.key].safeParse(currentAnswer).success

  if (currentQuestion.key === "plannedAttendance") {
    const { year, semester } = data.plannedAttendance
    canContinue = year.trim().length > 0 && (semester === "Winter" || semester === "Summer")
  }

  function next() {
    if (activeStep < questions.length - 1) {
      setStep(activeStep + 1)
    }
  }

  function back() {
    if (step > 0) {
      setStep(step - 1)
    }
  }

  async function generateRoadmap() {
    if (!canContinue || isSubmitting) {
      return
    }

    setIsSubmitting(true)

    try {
      const answersResult = roadmapAnswersSchema.safeParse({
        countryOfHighschool: data.countryOfHighschool,
        citizenships: data.citizenships,
        plannedStudienkollegs: data.plannedStudienkollegs,
        plannedAttendance: {
          year: data.plannedAttendance.year,
          semester: data.plannedAttendance.semester.toUpperCase(),
        },
        subscribedToMarketing: data.subscribedToMarketing,
      })

      if (!answersResult.success) {
        toast.error("Please complete all fields before generating your roadmap")

        return
      }

      const answers: RoadmapAnswers = answersResult.data

      let response: Awaited<ReturnType<typeof sendMagicLinkEmail>>
      if (session?.isAuthenticated) {
        response = await updateUserWithRoadmapAnswers(answers)
      } else {
        response = await sendMagicLinkEmail({
          email: data.email || null,
          redirectTo: "roadmap",
          answers,
        })
      }


      if (!response.success) {
        toast.error(response.error)

        return
      }

      toast.success("Check your e-mail!")
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handlePrimaryAction() {
    if (step < questions.length - 1) {
      next()
      return
    }

    await generateRoadmap()
  }

  return (
    <div className="w-full max-w-2xl xl:max-w-lg rounded-3xl border border-border bg-card p-8 shadow-(--shadow-accent) md:p-10">
      <div className="mb-6 flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Step {activeStep + 1} of {questions.length}
        </span>
        <div className="flex gap-1.5">
          {questions.map((_, index) => (
            <div
              key={index}
              className={`h-1.5 rounded-full transition-all ${index === activeStep ? "w-8 bg-foreground" : index < activeStep ? "w-1.5 bg-foreground" : "w-1.5 bg-border"}`}
            />
          ))}
        </div>
      </div>

      <h2 className="mb-6 text-2xl font-semibold md:text-3xl">{currentQuestion.label}</h2>

      {currentQuestion.key === "countryOfHighschool" && (
        <div className="space-y-2">
          <Label htmlFor="countryOfHighschool" className="sr-only">
            {currentQuestion.label}
          </Label>
          <Combobox value={data.countryOfHighschool} onValueChange={(value) => setData({ ...data, countryOfHighschool: value ?? '' })} items={COUNTRIES}>
            <ComboboxInput className='h-14 rounded-xl border border-border bg-background px-4 outline-none transition-colors focus:border-ring focus:ring-2 focus:ring-ring/30' id='countryOfHighschool' placeholder="Select a country" />
            <ComboboxContent>
              <ComboboxEmpty>No items found.</ComboboxEmpty>
              <ComboboxList>
                {(item) => (
                  <ComboboxItem key={item} value={item}>
                    {item}
                  </ComboboxItem>
                )}
              </ComboboxList>
            </ComboboxContent>
          </Combobox>
        </div>
      )}

      {currentQuestion.key === "citizenships" && (
        <MultiCombobox
          className='h-14 rounded-xl border border-border bg-background outline-none transition-colors focus:border-ring focus:ring-2 focus:ring-ring/30'
          items={COUNTRY_OPTIONS}
          selectedValues={data.citizenships}
          onSelectedValuesChange={(values) => setData({ ...data, citizenships: values })}
          placeholder="Search countries"
        />
      )}

      {currentQuestion.key === "plannedStudienkollegs" && (
        <MultiCombobox
          className='h-14 rounded-xl border border-border bg-background outline-none transition-colors focus:border-ring focus:ring-2 focus:ring-ring/30'
          items={STUDIENKOLLEG_OPTIONS}
          selectedValues={data.plannedStudienkollegs}
          onSelectedValuesChange={(values) => setData({ ...data, plannedStudienkollegs: values })}
          placeholder="Search Studienkollegs"
        />
      )}

      {currentQuestion.key === "plannedAttendance" && (
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <Label htmlFor="planned-year" className="sr-only">Planned year</Label>
            <Combobox
              value={data.plannedAttendance.year}
              onValueChange={(value) => setData({ ...data, plannedAttendance: { ...data.plannedAttendance, year: value ?? "" } })}
              items={Array.from({ length: 4 }, (_, i) => String(new Date().getFullYear() + i))}
            >
              <ComboboxInput id="planned-year" className="h-14 rounded-xl border border-border bg-background px-4 outline-none transition-colors focus:border-ring focus:ring-2 focus:ring-ring/30" placeholder="Year" />
              <ComboboxContent>
                <ComboboxEmpty>No items found.</ComboboxEmpty>
                <ComboboxList>
                  {(item) => (
                    <ComboboxItem key={item} value={item}>
                      {item}
                    </ComboboxItem>
                  )}
                </ComboboxList>
              </ComboboxContent>
            </Combobox>
          </div>

          <div>
            <Label htmlFor="planned-semester" className="sr-only">Planned semester</Label>
            <Combobox
              value={data.plannedAttendance.semester}
              onValueChange={(value) => setData({ ...data, plannedAttendance: { ...data.plannedAttendance, semester: value ?? "" } })}
              items={["Winter", "Summer"]}
            >
              <ComboboxInput id="planned-semester" className="h-14 rounded-xl border border-border bg-background px-4 outline-none transition-colors focus:border-ring focus:ring-2 focus:ring-ring/30" placeholder="Semester" />
              <ComboboxContent>
                <ComboboxEmpty>No items found.</ComboboxEmpty>
                <ComboboxList>
                  {(item) => (
                    <ComboboxItem key={item} value={item}>
                      {item}
                    </ComboboxItem>
                  )}
                </ComboboxList>
              </ComboboxContent>
            </Combobox>
          </div>
        </div>
      )}

      {currentQuestion.key === "email" && (
        <div className="space-y-4">
          <Label htmlFor="email" className="sr-only">
            {currentQuestion.label}
          </Label>
          <InputGroup className='h-14 rounded-xl border-border bg-background text-sm gap-2 px-2'>
            <InputGroupInput
              id="email"
              type="email"
              autoFocus
              value={data.email}
              placeholder="your@email.com"
              onChange={(event) => setData({ ...data, email: event.target.value })}
              onKeyDown={(event) => {
                if (event.key === "Enter" && canContinue) {
                  event.preventDefault()
                  void handlePrimaryAction()
                }
              }}
              maxLength={255} />
            <InputGroupAddon>
              <MailIcon />
            </InputGroupAddon>
          </InputGroup>
          <div className='w-full bg-gray-100 px-7 py-4 rounded-xl border border-gray-200'>
            <p className='text-muted-foreground text-sm'>We&apos;ll email you the link for your roadmap</p>
          </div>
          <p className='text-muted-foreground text-sm'>By creating an account, you agree to our Terms of Service and Privacy Policy.</p>
          <div className="flex items-start gap-3 rounded-xl border border-border bg-background px-4 py-3">
            <Checkbox
              id="receive-tips-and-recommendations"
              checked={data.subscribedToMarketing}
              onCheckedChange={(checked) =>
                setData({
                  ...data,
                  subscribedToMarketing: checked === true,
                })
              }
              className="mt-0.5"
            />
            <Label
              htmlFor="receive-tips-and-recommendations"
              className="text-sm font-normal leading-6 text-foreground"
            >
              I&apos;d like to receive personalized tips and recommendations about services relevant to my journey to Germany (e.g., resources, blocked accounts, health insurance). It&apos;s free and you can unsubscribe at any time!
            </Label>
          </div>
        </div>
      )}

      <div className="mt-8 flex items-center justify-between">
        <Button type="button" variant="ghost" onClick={back} disabled={step === 0 || isSubmitting} className="rounded-full">
          <ArrowLeft className="mr-1 h-4 w-4" /> Back
        </Button>
        <Button
          type="button"
          onClick={handlePrimaryAction}
          disabled={!canContinue || isSubmitting}
          className="h-12 rounded-full bg-foreground px-6 text-background hover:bg-foreground/90"
        >
          {activeStep === questions.length - 1 ? (isSubmitting ? "Sending..." : "Generate roadmap") : "Continue"}
          <ArrowRight className="ml-1 h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}