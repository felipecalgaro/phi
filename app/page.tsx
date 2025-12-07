import { ApplicationButton } from '@/components/application-button';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ArrowRight, Check, GraduationCap } from "lucide-react";
import Image from 'next/image';
import Link from 'next/link';

const benefits = [
  "documents and translations",
  "deadlines and submissions",
  "Aufnahmetest application and preparation",
  "visa and blocked account",
  "health insurance and finances for Studienkolleg",
  "housing and avoiding scams",
  "German culture and daily life in Studienkolleg"
];

const materials = [
  {
    title: "Clear Your Aufnahmetest",
    description: "Access a variety of math exercises and C-Tests from real Aufnahmetests to help you in your preparation.",
    image: {
      src: '/exercises-image.png',
      alt: 'Exercises Image',
      width: 887,
      height: 863
    },
    buttonText: "Explore Exercises",
    link: "/exercises"
  },
  {
    title: "Your Manual for Studienkolleg",
    description: "Everything you need to know about your journey to Studienkolleg, from the application to the arrival.",
    image: {
      src: '/blog-image.png',
      alt: 'Blog Image',
      width: 620,
      height: 597
    },
    buttonText: "Read the Blog",
    link: "/blog"
  }
]

export default function Home() {
  return (
    <>
      <section className="relative flex items-center justify-center flex-col bg-(image:--gradient-hero) sm:px-8 px-4 pb-24 sm:pt-6 pt-12 lg:px-12 sm:gap-12 gap-16">
        <header className="w-full flex justify-between items-center max-w-7xl min-h-16 gap-x-8 gap-y-6 flex-wrap sm:px-0 px-2">
          <Link href="/" className="flex items-center gap-2 text-white font-bold text-xl">
            <GraduationCap className="h-7 w-7 text-white" />
            <span>Guide to STK</span>
          </Link>

          <nav className="flex items-center gap-2 flex-wrap">
            <Link href="/exercises" className={cn(buttonVariants({ variant: 'ghost' }), "text-white/80 hover:text-white hover:bg-white/10")}>Exercises</Link>
            <Link href="/blog" className={cn(buttonVariants({ variant: 'ghost' }), "text-white/80 hover:text-white hover:bg-white/10")}>Blog</Link>
            <ApplicationButton className={cn(buttonVariants({ variant: 'gold' }), "ml-2 sm:h-8 h-8 rounded-md sm:w-min w-min sm:px-4 px-4 sm:py-2 py-2 sm:text-sm text-sm")}>
              Apply Now
            </ApplicationButton>
          </nav>
        </header>

        <div className='flex items-center justify-center'>
          <div className="absolute right-1/4 top-1/3 h-64 w-64 rounded-full bg-accent/10 blur-3xl" />

          <div className="relative z-10 flex xl:flex-nowrap flex-wrap justify-center items-center xl:max-w-7xl max-w-3xl gap-x-16 gap-y-24">
            <div className="flex flex-col justify-center space-y-2 sm:px-0 px-2">

              <h1 className="animate-fade-in max-[400px]:text-4xl max-[320px]:text-3xl text-5xl font-black tracking-tight text-white drop-shadow-lg sm:text-7xl lg:text-8xl w-min">
                Your Guide to
                <span className="block w-min bg-linear-to-r from-(--primary-glow) to-primary bg-clip-text text-transparent lg:h-28 sm:h-20 h-16 max-[320px]:h-12">
                  Studienkolleg
                </span>
              </h1>

              <p className="animate-fade-in-delay-1 text-xl text-white/90 drop-shadow-md sm:text-3xl sm:max-w-lg">
                Tailor-made support from a former Studienkolleg student.
              </p>

              <div className="animate-fade-in-delay-3 sm:mt-16 mt-8 flex justify-start items-center sm:w-auto w-60">
                <ApplicationButton />
              </div>
            </div>

            <div className="flex flex-col justify-center space-y-8 xl:max-w-lg max-w-2xl">
              <div className="animate-fade-in-delay-2 rounded-3xl bg-gradient-card max-[360px]:px-6 px-10 py-10 shadow-glow backdrop-blur-sm border border-white/20 bg-white/5 text-white">
                <h2 className="mb-6 max-[360px]:text-2xl text-3xl font-bold flex items-center gap-3">
                  Direct guidance with all you need for Studienkolleg:
                </h2>

                <ul className="space-y-4 text-left">
                  {benefits.map((benefit, index) => (
                    <li key={index} className="flex items-start max-[320px]:gap-3 gap-4">
                      <div className="mt-0.5 flex max-[320px]:size-5 size-6 shrink-0 items-center justify-center max-[320px]:rounded-sm rounded-md bg-secondary shadow-button">
                        <Check className="max-[320px]:size-3 size-4 text-white font-bold" />
                      </div>
                      <span className="text-lg leading-relaxed font-medium">
                        {benefit}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>
      {materials.map((material, index) => {
        const isEven = index % 2 === 0

        return <section key={index} className={cn("py-24 px-6 lg:px-12 flex justify-center items-center", isEven ? "bg-(image:--gradient-red)" : "bg-(image:--gradient-gold)")}>
          <div className="flex justify-center items-center max-w-7xl gap-x-10 gap-y-18 sm:flex-nowrap flex-wrap">
            <Image src={material.image.src} alt={material.image.alt} width={material.image.width} height={material.image.height} className={cn('lg:w-md md:w-sm w-xs', isEven ? 'order-1' : 'order-2')} />

            <div className={cn("space-y-6 max-w-lg", isEven ? "order-2" : "order-1")}>
              <h2 className={cn("sm:text-4xl text-3xl font-black lg:text-5xl", isEven ? "text-white" : "text-foreground")}>
                {material.title}
              </h2>
              <p className={cn("sm:text-xl text-lg leading-relaxed", isEven ? "text-white/80" : "text-foreground/80")}>
                {material.description}
              </p>
              <Link href="/exercises" className={cn(buttonVariants({ size: 'lg', variant: isEven ? 'gold' : undefined }), "group shadow-none")}>
                {material.buttonText}
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </div>
        </section>
      })}
      <footer className="bg-foreground text-background py-12 px-6 lg:px-12 flex flex-col justify-center items-center">
        <div className="flex justify-between items-start max-w-2xl gap-8 w-full flex-wrap">
          <div className="space-y-4 max-[480px]:max-w-full max-w-60">
            <Link href="/" className="flex items-center gap-2 font-bold text-xl">
              <GraduationCap className="h-7 w-7" />
              <span>Guide to STK</span>
            </Link>
            <p className="text-background/70 text-sm leading-relaxed">
              Your trusted companion on the journey to studying in Germany. From application to arrival.
            </p>
          </div>
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Quick Links</h3>
            <nav className="flex flex-col gap-2">
              <Link href={process.env.NEXT_PUBLIC_APPLICATION_FORM_URL || "#"} className="text-background/70 hover:text-background transition-colors text-sm">
                Guide to Studienkolleg
              </Link>
              <Link href="/exercises" className="text-background/70 hover:text-background transition-colors text-sm">
                Exercises
              </Link>
              <Link href="/blog" className="text-background/70 hover:text-background transition-colors text-sm">
                Blog
              </Link>
            </nav>
          </div>
        </div>
        <div className="mt-10 pt-8 border-t border-background/10 text-center text-background/50 text-sm max-w-4xl w-full">
          © {new Date().getFullYear()} Guide to Studienkolleg. All rights reserved.
        </div>
      </footer>
    </>
  );
}
