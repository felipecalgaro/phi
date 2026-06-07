'use client'

import { useState } from "react"
import { ArrowLeft, ArrowRight, MailIcon } from "lucide-react"
import { MultiCombobox, type MultiComboboxOption } from "@/components/multi-combobox"
import countries from "@/data/countries.json"
import studienkollegs from "@/data/studienkollegs.json"
import { Checkbox } from "./ui/checkbox"
import { Button } from "./ui/button"
import { Label } from "./ui/label"
import { Combobox, ComboboxContent, ComboboxEmpty, ComboboxInput, ComboboxItem, ComboboxList } from './ui/combobox'
import { z } from "zod"
import { InputGroup, InputGroupAddon, InputGroupInput } from './ui/input-group'

const formDataSchema = z.object({
  highschoolCountry: z.string().min(1),
  citizenships: z.array(z.string()).min(1),
  studienkollegs: z.array(z.string()).min(1),
  plannedAttendance: z.object({
    year: z.string().min(1),
    semester: z.union([z.enum(["Winter", "Summer"]), z.string().length(0)]),
  }),
  email: z.email(),
  receiveTipsAndRecommendations: z.boolean(),
})

type FormData = z.infer<typeof formDataSchema>

const COUNTRY_OPTIONS: MultiComboboxOption[] = countries.map((country) => ({
  label: country,
  value: country,
}))

const STUDIENKOLLEG_OPTIONS: MultiComboboxOption[] = studienkollegs.map((item) => ({
  label: item.name,
  value: item.id,
}))

export function QuestionsCard() {
  const [step, setStep] = useState(0)
  const [data, setData] = useState<FormData>(() => ({
    highschoolCountry: "",
    citizenships: [],
    studienkollegs: [],
    plannedAttendance: { year: "", semester: "" },
    email: "",
    receiveTipsAndRecommendations: false,
  } as unknown as FormData))

  const questions = [
    { key: "highschoolCountry", label: "Tell us, where did you complete high school?" },
    { key: "citizenships", label: "Which citizenships(s) do you have?" },
    {
      key: "studienkollegs",
      label: "Which Studienkollegs do you want to apply to?",
    },
    { key: "plannedAttendance", label: "When do you plan to attend Studienkolleg?" },
    { key: "email", label: "One last step — save your roadmap to your free account." },
  ] as const

  const currentQuestion = questions[step]
  const currentAnswer = data[currentQuestion.key]
  let canContinue = formDataSchema.shape[currentQuestion.key].safeParse(currentAnswer).success

  if (currentQuestion.key === "plannedAttendance") {
    const { year, semester } = data.plannedAttendance
    canContinue = year.trim().length > 0 && (semester === "Winter" || semester === "Summer")
  }

  function next() {
    if (step < questions.length - 1) {
      setStep(step + 1)
    }
  }

  function back() {
    if (step > 0) {
      setStep(step - 1)
    }
  }

  return (
    <div className="w-full max-w-2xl xl:max-w-lg rounded-3xl border border-border bg-card p-8 shadow-(--shadow-accent) md:p-10">
      <div className="mb-6 flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Step {step + 1} of {questions.length}
        </span>
        <div className="flex gap-1.5">
          {questions.map((_, index) => (
            <div
              key={index}
              className={`h-1.5 rounded-full transition-all ${index === step ? "w-8 bg-foreground" : index < step ? "w-1.5 bg-foreground" : "w-1.5 bg-border"}`}
            />
          ))}
        </div>
      </div>

      <h2 className="mb-6 text-2xl font-semibold md:text-3xl">{currentQuestion.label}</h2>

      {currentQuestion.key === "highschoolCountry" && (
        <div className="space-y-2">
          <Label htmlFor="highschoolCountry" className="sr-only">
            {currentQuestion.label}
          </Label>
          <Combobox value={data.highschoolCountry} onValueChange={(value) => setData({ ...data, highschoolCountry: value ?? '' })} items={countries}>
            <ComboboxInput className='h-14 rounded-xl border border-border bg-background px-4 outline-none transition-colors focus:border-ring focus:ring-2 focus:ring-ring/30' id='highschoolCountry' placeholder="Select a country" />
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

      {currentQuestion.key === "studienkollegs" && (
        <MultiCombobox
          className='h-14 rounded-xl border border-border bg-background outline-none transition-colors focus:border-ring focus:ring-2 focus:ring-ring/30'
          items={STUDIENKOLLEG_OPTIONS}
          selectedValues={data.studienkollegs}
          onSelectedValuesChange={(values) => setData({ ...data, studienkollegs: values })}
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
                  next()
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
              checked={data.receiveTipsAndRecommendations}
              onCheckedChange={(checked) =>
                setData({
                  ...data,
                  receiveTipsAndRecommendations: checked === true,
                })
              }
              className="mt-0.5"
            />
            <Label
              htmlFor="receive-tips-and-recommendations"
              className="text-sm font-normal leading-6 text-muted-foreground"
            >
              I&apos;d like to receive personalized tips and recommendations about services relevant to my journey to Germany (e.g., resources, blocked accounts, health insurance). It&apos;s free and you can unsubscribe at any time!
            </Label>
          </div>
        </div>
      )}

      <div className="mt-8 flex items-center justify-between">
        <Button variant="ghost" onClick={back} disabled={step === 0} className="rounded-full">
          <ArrowLeft className="mr-1 h-4 w-4" /> Back
        </Button>
        <Button
          onClick={next}
          disabled={!canContinue}
          className="h-12 rounded-full bg-foreground px-6 text-background hover:bg-foreground/90"
        >
          {step === questions.length - 1 ? "Generate roadmap" : "Continue"}
          <ArrowRight className="ml-1 h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}