import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ArrowRight, Navigation } from "lucide-react";
import Image from 'next/image';
import Link from 'next/link';

export default function Home() {
  return (
    <>
      <section className="relative flex items-center justify-start flex-col bg-(image:--gradient-hero) sm:px-8 px-4 pb-24 pt-12 lg:px-12 gap-24 min-h-screen">
        <header className="w-full flex justify-between items-center max-w-7xl min-h-16 gap-x-20 gap-y-6 flex-wrap">
          <Link href="/" className="flex items-center sm:gap-4 gap-2 text-white font-bold sm:text-xl text-lg">
            <Navigation className="sm:size-6 size-5 text-white" />
            <span>Guide to Studienkolleg</span>
          </Link>

          <nav className="flex xs:items-center items-start xs:gap-4 gap-3 flex-wrap xs:flex-row flex-col">
            <Link href="/blog" className={cn(buttonVariants(), "text-white/80 hover:text-white hover:bg-white/10 bg-transparent border border-white/20")}>Blog</Link>
            <Link href="/exercises" className={cn(buttonVariants(), "text-white/80 hover:text-white hover:bg-white/10 bg-transparent border border-white/20")}>Exercises</Link>
            <Link href='/acing-aufnahmetest' className={cn(buttonVariants({ variant: 'outline' }), "bg-transparent border-primary text-primary hover:text-black shadow-button hover:shadow-glow transition-all cursor-pointer rounded-md sm:w-min w-min sm:px-4 px-4 sm:py-2 py-2 text-sm")}>
              Acing Aufnahmetest
            </Link>
          </nav>
        </header>

        <div className='flex items-center justify-center'>
          <div className="relative z-10 flex xl:flex-nowrap flex-wrap justify-center items-center xl:max-w-7xl max-w-3xl gap-x-16 gap-y-24">
            <div className="flex flex-col justify-center items-center gap-y-10 sm:px-0 px-2">

              <h1 className="animate-fade-in max-[480px]:text-5xl max-[360px]:text-4xl text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-black tracking-tight text-white drop-shadow-lg w-min text-center">
                Studienkolleg <br /> made&nbsp;
                <span className="w-min bg-linear-to-r from-primary from-75% to-[hsl(42,94%,26%)] bg-clip-text text-transparent lg:h-36 md:h-28 h-20 max-[320px]:h-12">
                  simple.
                </span>
              </h1>

              <p className="animate-fade-in-delay-1 sm:text-2xl text-xl text-white/90 drop-shadow-md md:text-3xl text-center">
                Your trusted companion on your admission journey.
              </p>
            </div>
          </div>
        </div>
      </section>
      <section className="py-24 px-6 lg:px-12 flex justify-center items-center bg-(image:--gradient-red)">
        <div className="flex justify-center items-center max-w-7xl gap-x-10 gap-y-18 sm:flex-nowrap flex-wrap">
          <Image src='/passing-exam.png' alt="Passing Exam" width={620} height={597} className='lg:w-md md:w-sm w-xs' />

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
      <section className="py-24 px-6 lg:px-12 flex justify-center items-center bg-(image:--gradient-hero)">
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
