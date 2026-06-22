import { AccessCourseButton } from '@/components/acing-aufnahmetest/access-course-button';
import { LogInOutButton } from '@/components/acing-aufnahmetest/log-in-out-button';
import { Header } from '@/components/header';
import { Badge } from '@/components/ui/badge';
import { buttonVariants } from '@/components/ui/button';
import { env } from '@/lib/env';
import { cn } from '@/lib/utils';
import {
  BookOpen,
  Check,
  ChevronRight,
  Download,
  FileText,
  Mail,
  MessageCircle,
  ShieldCheck,
  Target,
  User,
  Users,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

const benefits = [
  {
    icon: BookOpen,
    text: "Straightforward guidance to pass the exam condensed in a few lessons",
  },
  {
    icon: Target,
    text: "Strategies and resources to improve your score and stand out from competition",
  },
  {
    icon: Users,
    text: "Community of Studienkolleg applicants to share doubts and tips with",
  },
  {
    icon: ShieldCheck,
    text: "Access to private guidance via WhatsApp through the whole admission process",
  },
];

const modules = [
  {
    title: 'From Zero to Exam-Ready',
    description: 'The core lessons and study strategy for your preparation.',
    columns: [
      [
        'Aufnahmetest full overview',
        'Straightforward study plan and resources for preparation',
        'Mistakes to avoid before and during exam day',
        'Most common math topics and problems',
      ],
      [
        'Most common German problems and grammar',
        'Approaching C-Tests the right way',
        'Useful strategies during the exam',
      ],
    ],
  },
  {
    title: 'Bonus',
    description: 'Extra support and materials included with the course.',
    columns: [
      [
        'Resources for Aufnahmetest, including mock tests and PDFs of grammar topics applied to the exam',
        'Access to private guidance via WhatsApp',
        'Community of Studienkolleg applicants',
      ],
    ],
  },
];

const mockTests = [
  "Aufnahmetest of KIT",
  "Aufnahmetest of Hochschule Kaiserslautern",
  "Aufnahmetest of TUB",
];

const contactEmail = `onboarding@${env.NEXT_PUBLIC_EMAIL_DOMAIN}`;

export default function Home() {
  return (
    <main className="min-h-screen hero-background">
      <Header />

      <section id="course" className="px-4 pb-20 pt-32 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-6xl">
          <div className="grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="text-center lg:text-left">
              <Badge className="mb-4 rounded-full border-border bg-white px-4 py-1.5 text-foreground">
                <BookOpen className="mr-1.5 h-3 w-3" /> Online course
              </Badge>
              <h1 className="mb-6 text-4xl font-extrabold leading-[0.95] xs:text-5xl sm:text-6xl xl:text-7xl">
                Clear your <span className="text-gradient-accent">Aufnahmetest.</span>
              </h1>
              <p className="mx-auto max-w-2xl text-lg leading-relaxed text-muted-foreground sm:text-xl lg:mx-0">
                Get admitted into the Studienkolleg you want with a practical course, community, and private guidance.
              </p>

              <div className="mt-8 flex flex-col items-center gap-3 xs:flex-row lg:justify-start justify-center">
                <LogInOutButton className="h-14 rounded-full border border-border bg-card px-6 text-base font-semibold text-foreground hover:bg-gray-100 hover:text-accent-foreground sm:h-16"
                />
                <AccessCourseButton className="rounded-full text-base sm:text-base" />
              </div>
            </div>

            <div className="rounded-3xl border border-border bg-card p-3 shadow-(--shadow-accent)">
              <Image
                src="/aat.png"
                alt="Acing Aufnahmetest course preview"
                width={1200}
                height={675}
                priority
                className="w-full rounded-2xl border border-border bg-muted"
              />
              <div className="px-3 py-5 sm:px-5">
                <div className="mb-3 flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <BookOpen className="size-4 text-foreground" />
                  Course, community and guidance in one place
                </div>
                <p className="text-2xl font-semibold leading-tight">
                  All you need to ace the Aufnahmetest for <span className="bg-primary px-0.5 rounded-xs">only €19</span>.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-14 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {benefits.map((benefit) => {
              const Icon = benefit.icon;

              return (
                <div key={benefit.text} className="rounded-3xl border border-border bg-card p-5 shadow-sm">
                  <div className="mb-4 flex size-11 items-center justify-center rounded-2xl" style={{ background: "var(--gradient-accent)" }}>
                    <Icon className="size-5 text-foreground" />
                  </div>
                  <p className="text-sm font-medium leading-relaxed text-foreground">
                    {benefit.text}
                  </p>
                </div>
              );
            })}
          </div>

          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            {modules.map((courseModule) => (
              <div key={courseModule.title} className="rounded-3xl border border-border bg-card p-6 shadow-sm sm:p-8">
                <div className="mb-6">
                  <h2 className="text-2xl font-semibold">{courseModule.title}</h2>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {courseModule.description}
                  </p>
                </div>
                <div className={cn("grid gap-4", courseModule.columns.length > 1 && "sm:grid-cols-2")}>
                  {courseModule.columns.map((topicColumn) => (
                    <ul key={topicColumn[0]} className="space-y-3">
                      {topicColumn.map((topic) => (
                        <li key={topic} className="flex items-start gap-3 text-sm leading-relaxed text-muted-foreground">
                          <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-(image:--gradient-accent)">
                            <Check strokeWidth={3} className="size-3 text-foreground" />
                          </span>
                          <span>{topic}</span>
                        </li>
                      ))}
                    </ul>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="community" className="px-4 py-20 sm:px-8 lg:px-12">
        <div className="mx-auto grid max-w-6xl items-center gap-8 lg:grid-cols-[0.85fr_1.15fr]">
          <div>
            <Badge className="mb-4 rounded-full border-border bg-white px-4 py-1.5 text-foreground">
              <Users className="mr-1.5 h-3 w-3" /> Community
            </Badge>
            <h2 className="text-3xl font-semibold leading-tight sm:text-4xl">
              You&apos;re not doing this alone.
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
              Join other Studienkolleg applicants preparing for the Aufnahmetest, exchanging doubts, tips, resources, and motivation along the way.
            </p>
          </div>

          <div className="rounded-3xl border border-border bg-card p-8 shadow-(--shadow-accent)">
            <div className="mb-5 flex size-14 items-center justify-center rounded-2xl" style={{ background: "var(--gradient-accent)" }}>
              <MessageCircle className="size-7 text-foreground" />
            </div>
            <h3 className="text-2xl font-semibold">Connect with other Studienkolleg applicants.</h3>
            <p className="my-3 text-muted-foreground">
              The WhatsApp community is for students who want a place to share their experiences and get support throughout their journey.
            </p>
            <Link href='/community' className='group flex justify-start items-center gap-4 rounded-md hover:bg-accent/10 transition-all w-full mt-6 px-4 py-3 cursor-pointer'>
              <Image src="/germany-flag.svg" alt="Germany flag" width={60} height={60} className='p-2 bg-primary/40 rounded-lg border border-border' />
              <p className='text-lg font-semibold'>STK Community</p>
              <ChevronRight className='size-5 text-muted-foreground transition-transform group-hover:translate-x-1' />
            </Link>
          </div>
        </div>
      </section>

      <section id="private-guidance" className="px-4 py-20 sm:px-8 lg:px-12">
        <div className="mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="mx-auto w-full max-w-sm lg:mx-0">
            <Image
              src="/me.png"
              alt="Course creator"
              width={286}
              height={400}
              className="w-full rounded-3xl border border-border bg-card object-cover shadow-(--shadow-accent)"
            />
          </div>

          <div className="rounded-3xl border border-border bg-card p-8 shadow-sm sm:p-10">
            <Badge variant="secondary" className="mb-4 rounded-full border-border bg-card px-4 py-1.5 text-foreground">
              <User className="mr-1.5 h-3 w-3" /> Private guidance
            </Badge>
            <h2 className="text-3xl font-semibold leading-tight sm:text-4xl">
              Direct support from someone who went through it.
            </h2>
            <div className="mt-5 space-y-4 text-base leading-relaxed text-muted-foreground sm:text-lg">
              <p>
                I&apos;m a former Studienkolleg student, who went through the admission process and took the Aufnahmetest of the Hochschule Kaiserslautern (HS-KL), and was fortunate to have someone supporting me through all the steps, so that at the end my admission was successful.
              </p>
              <p>
                However, while preparing for the Aufnahmetest, the lack of structured resources that could help international students like me to prepare effectively for the exam was overwhelming. This same gap is what I now aim to solve with my experience, providing a comprehensive and strategic approach to acing the Aufnahmetest and getting admitted into the Studienkolleg of your choice!
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="mock-tests" className="px-4 py-20 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-6xl">
          <div className="mx-auto max-w-2xl text-center">
            <Badge variant="secondary" className="mb-4 rounded-full border-border bg-card px-4 py-1.5 text-foreground">
              <FileText className="mr-1.5 h-3 w-3" /> Free resources
            </Badge>
            <h2 className="text-3xl font-semibold leading-tight sm:text-4xl">
              Mock Aufnahmetests
            </h2>
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {mockTests.map((test) => (
              <Link
                download
                href={`/mock-exams/${test}.pdf`}
                key={test}
                className="group rounded-3xl border border-border bg-card p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-(--shadow-accent) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30"
              >
                <div className="mb-5 flex size-12 items-center justify-center rounded-2xl bg-background">
                  <Download strokeWidth={1.8} className="size-6 text-foreground" />
                </div>
                <h3 className="text-lg font-semibold leading-snug">{test}</h3>
                <p className="mt-2 text-sm text-muted-foreground">PDF download</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section id="contact" className="px-4 pb-24 pt-20 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-6xl">
          <div className="relative overflow-hidden rounded-3xl border border-border bg-card p-8 text-center shadow-(--shadow-accent) sm:p-12">
            <div className="relative">
              <Badge variant="secondary" className="mb-4 rounded-full border-border bg-card px-4 py-1.5 text-foreground">
                <Mail className="mr-1.5 h-3 w-3" /> Contact
              </Badge>
              <h2 className="text-3xl font-semibold leading-tight sm:text-4xl">
                Questions about Acing Aufnahmetest?
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-lg leading-relaxed text-muted-foreground">
                Feel free to reach out if you have any questions about the course, community, or private guidance.
              </p>
              <a
                href={`mailto:${contactEmail}`}
                className={cn(buttonVariants({ variant: "dark", size: "lg" }), "mt-8 rounded-full px-6")}
              >
                Email me
                <Mail className="size-4" />
              </a>
              <p className="mt-4 text-sm text-muted-foreground">{contactEmail}</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
