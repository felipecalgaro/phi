import { AccessCourseButton } from '@/components/acing-aufnahmetest/access-course-button';
import { LogInOutButton } from '@/components/acing-aufnahmetest/log-in-out-button';
import { Price } from '@/components/acing-aufnahmetest/price';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Check, Download, Navigation, Target } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

const benefits = [
  "Straightforward lessons to pass the exam condensed in only a few hours",
  "Strategies to improve your score and stand out from competition",
  "All the resources you need to prepare for the exam",
  "Access to direct help via WhatsApp through the whole admission process",
];

const modules = {
  'From Zero to Exam-Ready': [['Aufnahmetest full overview', 'Straightforward study plan and resources for preparation', 'Mistakes to avoid before and during exam day'], ['Most common math topics and problems', 'Most common German exercises', 'Useful strategies during the exam', 'Approaching C-Tests the right way']],
  'BONUS': [['Access to direct help via WhatsApp through the whole admission process, answering questions and providing guidance', 'Mock Aufnahmetests from various Studienkollegs with solutions and explanations']],
}

const mockTests = [
  'Aufnahmetest of Hochschule Kaiserslautern (1)',
  'Aufnahmetest of Hochschule Kaiserslautern (2)',
  'Aufnahmetest of Universität Heidelberg',
  'Aufnahmetest of Technische Universität Berlin',
  'Aufnahmetest of Universität Nordhausen',
]

export default function Home() {
  return (
    <>
      <section id='course' className="pt-20 pb-32 min-h-screen relative flex items-center justify-center flex-col bg-(image:--gradient-hero) sm:px-8 px-4 lg:px-12 gap-28">
        <div className="absolute right-1/4 xl:top-1/3 top-2/3 h-64 w-64 rounded-full bg-accent/10 blur-3xl" />

        <div className="relative z-10 flex xl:flex-nowrap flex-wrap justify-center items-center xl:max-w-7xl max-w-3xl gap-x-16 gap-y-24">
          <div className="flex flex-col justify-center space-y-2 sm:px-0 px-2 basis-1/2">
            <p className="flex items-center gap-2 text-white font-bold text-2xl mb-16">
              <Target strokeWidth={2} className="h-7 w-7 text-white" />
              <span>Acing Aufnahmetest</span>
            </p>

            <h1 className="animate-fade-in max-[400px]:text-4xl max-[320px]:text-3xl text-5xl font-black tracking-tight text-white drop-shadow-lg sm:text-7xl md:text-8xl xl:text-7xl 2xl:text-8xl">
              Clear your
              <span className="block text-primary md:h-28 sm:h-22 h-16 max-[320px]:h-12">
                Aufnahmetest.
              </span>
            </h1>

            <p className="animate-fade-in-delay-1 text-xl text-white/90 drop-shadow-md sm:text-3xl">
              And get admitted into the Studienkolleg you want.
            </p>

            <div className="animate-fade-in-delay-3 sm:mt-16 mt-8 flex justify-start items-center sm:w-auto w-60">
              <AccessCourseButton />
            </div>
          </div>

          <div className="flex flex-col justify-center space-y-8 xl:max-w-lg max-w-2xl md:px-0 sm:px-6 px-0">
            <div className="flex flex-col animate-fade-in-delay-2 rounded-3xl bg-gradient-card max-[360px]:px-6 px-10 py-10 shadow-glow backdrop-blur-sm border border-white/20 bg-white/5 text-white">
              <h2 className="mb-8 max-[400px]:text-2xl text-3xl font-bold inline">
                All you need for acing the Aufnahmetest in one course:
              </h2>

              <ul className="sm:space-y-4 space-y-5 text-left">
                {benefits.map((benefit, index) => (
                  <li key={index} className="flex items-start max-[320px]:gap-3 gap-4">
                    <div className="sm:mt-0.5 mt-0 flex max-[320px]:size-5 size-6 shrink-0 items-center justify-center max-[320px]:rounded-sm rounded-md bg-primary shadow-button">
                      <Check strokeWidth={3} className="max-[320px]:size-3 size-4 text-white font-bold" />
                    </div>
                    <span className="font-medium sm:text-lg text-base">
                      {benefit}
                    </span>
                  </li>
                ))}
              </ul>

              <h2 className="mt-8 max-[400px]:text-2xl text-3xl font-bold inline text-start">
                For&nbsp;
                <span className="text-primary inline-block">
                  only <Price />
                </span>
                &nbsp;once.
              </h2>
            </div>
          </div>
        </div>

        <nav className="w-full flex justify-center items-center min-h-16 sm:gap-x-12 gap-x-8 gap-y-6">
          <div className='w-full flex justify-end'>
            <Link href="/" className="flex items-center gap-3 text-white font-bold text-lg">
              <Navigation className="size-5 text-white" />
              <span>Home</span>
            </Link>
          </div>
          <hr className='h-8 w-px border border-white/10' />
          <nav className="flex items-center gap-x-4 gap-y-2 flex-wrap w-full">
            <LogInOutButton />
            <Link href="/exercises" className={cn(buttonVariants(), "text-white/80 hover:text-white hover:bg-white/10 bg-transparent border border-white/20")}>Exercises</Link>
          </nav>
        </nav>
      </section>
      <section id='what-inside-course' className="py-36 px-3 lg:px-6 flex justify-center items-center flex-col gap-18 bg-(image:--gradient-red) text-white">
        <div className="flex flex-col justify-center items-center gap-18 lg:px-6 px-3">
          <h2 className="sm:text-4xl text-3xl font-black lg:text-5xl text-center">
            What&apos;s Inside the Course
          </h2>
          <p className="text-xl leading-relaxed text-white/80 text-center max-w-3xl">
            A comprehensive guide to clearing the Aufnahmetest in 3 modules and multiple video lessons, plus additional study materials to maximize your preparation:
          </p>
        </div>
        <div className='flex flex-col gap-6 justify-center items-center max-w-240 sm:px-3 px-0'>
          {Object.entries(modules).map(([mod, topics]: [string, string[][]], index) => (
            <div key={index} className='flex flex-col items-start gap-6 backdrop-blur-sm border border-white/20 bg-white/5 rounded-2xl p-8 w-full text-white'>
              <h3 className="text-2xl font-bold">{mod}</h3>
              <ul className={cn("text-left w-full sm:space-y-2 space-y-3", mod !== 'BONUS' ? 'grid sm:grid-cols-2 grid-cols-1 sm:gap-12 gap-0' : '')}>
                {topics.map((topicCol, index) => (
                  <div key={index} className='flex justify-start items-start flex-col sm:space-y-2 space-y-3'>
                    {topicCol.map((topic) => (
                      <li key={topic} className="flex items-start max-[320px]:gap-3 gap-4">
                        <div className="sm:mt-0.5 min-[320px]:mt-0 mt-0.5 flex max-[320px]:size-5 size-6 shrink-0 items-center justify-center max-[320px]:rounded-sm rounded-md bg-primary shadow-button">
                          <Check strokeWidth={3} className="max-[320px]:size-3 size-4 text-white font-bold" />
                        </div>
                        <span className="font-medium sm:text-lg text-base">
                          {topic}
                        </span>
                      </li>
                    ))}
                  </div>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>
      <section id='about-me' className="bg-(image:--gradient-hero) flex justify-center items-end gap-x-10 gap-y-18 py-36 px-3 lg:px-6 flex-nowrap max-[900px]:flex-wrap">
        <div className="space-y-12 max-w-lg">
          <h2 className="sm:text-4xl text-3xl font-black lg:text-5xl text-white">
            About Me
          </h2>
          <p className="text-lg text-white/80">
            I&apos;m a former Studienkolleg student, who went through the admission process and took the Aufnahmetest of the Hochschule Kaiserslautern (HS-KL), and was fortunate to have someone supporting me through all the steps, so that at the end my admission was successful.
            <br /><br />
            However, while preparing for the Aufnahmetest, the lack of structured resources that could help international students like me to prepare effectively for the exam was overwhelming. This same gap is what I now aim to solve with my experience, providing a comprehensive and strategic approach to acing the Aufnahmetest and getting admitted into the Studienkolleg of your choice!
          </p>
        </div>

        <Image src='/me.png' alt='Picture of me' width={286} height={400} className='rounded-lg' />
      </section>
      <section id='mock-tests' className="bg-(image:--gradient-gold) flex justify-center items-center w-full gap-x-10 gap-y-18 py-36 px-3 lg:px-6 flex-nowrap max-[900px]:flex-wrap">
        <div className="flex flex-col justify-center items-center gap-16 max-w-lg w-full">
          <h2 className="sm:text-4xl text-3xl font-black lg:text-5xl text-foreground text-center">
            (FREE) Mock Aufnahmetests
          </h2>
          <div className='flex flex-col justify-center items-center gap-4'>
            {mockTests.map((test, index) => (
              <Link download href={`/${test}.pdf`} key={index} className='flex justify-between items-center gap-6 backdrop-blur-sm border border-black/40 hover:bg-white/5 bg-white/10 transition-all duration-200 rounded-xl px-8 py-4 w-full text-foreground'>
                {test}
                <Download strokeWidth={1.5} className='size-6 text-foreground shrink-0' />
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
