import { QuestionsCard } from '@/components/questions-card';
import { Badge } from '@/components/ui/badge';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ArrowRight, Sparkles } from "lucide-react";
import Image from 'next/image';
import Link from 'next/link';

export default function Home() {
  return (
    <>
      <section className="hero-background relative flex xl:flex-nowrap flex-wrap items-center justify-center sm:px-8 px-4 pb-24 pt-12 lg:px-12 sm:gap-20 gap-12 min-h-screen">
        <div className="text-center lg:max-w-3xl max-w-5xl shrink w-min">
          <Badge variant="secondary" className="mb-5 rounded-full border-border bg-card px-4 py-1.5 text-xs font-medium">
            <Sparkles className="mr-1.5 h-3 w-3" /> Personalized in 2 min
          </Badge>
          <h1 className="mb-10 sm:text-6xl xs:text-5xl text-4xl font-extrabold leading-[0.95] xl:text-7xl">
            Your Guide to <span className="text-gradient-accent">Studienkolleg</span>, personalized.
          </h1>
          <p className="mx-auto max-w-lg text-lg text-muted-foreground">
            Answer a few questions and get a visual, step-by-step roadmap to study in Germany.
          </p>
        </div>
        <QuestionsCard />
      </section>
      <section className="py-24 px-6 lg:px-12 flex justify-center items-center bg-(image:--gradient-red)">
        <div className="flex justify-center items-center max-w-7xl gap-x-10 gap-y-18 sm:flex-nowrap flex-wrap">
          <Image src='/passing-exam.png' alt="Passing Exam" width={615} height={597} className='lg:w-md md:w-sm w-xs' />

          <div className="space-y-6 max-w-lg order-2">
            <h2 className="sm:text-4xl text-3xl font-black lg:text-5xl text-white">
              Acing Aufnahmetest
            </h2>
            <p className={cn("sm:text-xl text-lg leading-relaxed text-white/80")}>
              Comprehensive course designed to help you pass your Studienkolleg entrance exam with expert guidance and practice resources.
            </p>
            <Link href="/acing-aufnahmetest" className={cn(buttonVariants({ size: 'lg', variant: 'gold' }), "group shadow-none")}>
              View Course
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </section>
      <section className="py-24 px-6 lg:px-12 flex justify-center items-center bg-(image:--gradient-gold)">
        <div className="flex justify-center items-center max-w-7xl gap-x-10 gap-y-18 sm:flex-nowrap flex-wrap">
          <Image src='/book-germany.png' alt="Book about Germany" width={887} height={863} className='lg:w-md md:w-sm w-xs order-2' />

          <div className="space-y-6 max-w-lg">
            <h2 className="sm:text-4xl text-3xl font-black lg:text-5xl text-foreground">
              Acing Aufnahmetest
            </h2>
            <p className="sm:text-xl text-lg leading-relaxed text-foreground/80">
              Access a variety of math exercises and C-Tests from real Aufnahmetests to help you in your preparation.
            </p>
            <Link href="/acing-aufnahmetest" className={cn(buttonVariants({ size: 'lg', variant: 'secondary' }), "group shadow-none text-white")}>
              View Course
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </section>
      <section className="bg-(image:--gradient-hero) flex justify-center items-center flex-col py-24 gap-24 px-6 lg:px-12">
        <div className="flex justify-center items-center max-w-7xl gap-x-10 gap-y-18 sm:flex-nowrap flex-wrap">
          <Image src='/blog-posts.png' alt="Blog Posts" width={800} height={743} className='lg:w-md md:w-sm w-xs shadow-xl shadow-white/15 rounded-lg border border-gray-700' />

          <div className="space-y-6 max-w-lg order-2">
            <h2 className="sm:text-4xl text-3xl font-black lg:text-5xl text-white">
              Studienkolleg Blog
            </h2>
            <p className={cn("sm:text-xl text-lg leading-relaxed text-white/80")}>
              Here you will find tutorials, tips, common misunderstandings, and every information you need for Studienkolleg and the admission process.
            </p>
            <Link href="/blog" className={cn(buttonVariants({ size: 'lg' }), "group shadow-none text-black bg-white hover:bg-white cursor-pointer")}>
              View Blog
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
