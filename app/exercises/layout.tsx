import { NavigationSidebar } from '@/components/exercises/navigation-sidebar';
import { buttonVariants } from '@/components/ui/button';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';
import { Navigation, Target } from 'lucide-react';
import type { Metadata } from "next";
import Link from 'next/link';

export const metadata: Metadata = {
  title: "Aufnahmetest Exercises",
  description: "A collection of math exercises and C-tests for the Studienkolleg Aufnahmetest",
};

export default function ExercisesLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <SidebarProvider defaultOpen={false}>
      <NavigationSidebar />

      <div className='min-h-screen flex justify-start items-center flex-col gap-12 pt-8 w-full'>
        <div className='md:hidden flex justify-between items-center w-full px-12'>
          <Navigation className="size-7" />
          <SidebarTrigger className="[&_svg:not([class*='size-'])]:size-7" />
        </div>
        <header className="w-full md:flex hidden justify-between items-center max-w-240 min-h-16 flex-wrap px-8">
          <Link href="/" className="flex items-center sm:gap-4 gap-2 font-bold">
            <Navigation className="lg:size-6 size-5" />
            <span className='lg:text-xl text-lg'>Guide to Studienkolleg</span>
          </Link>
          <nav className="flex items-center gap-x-8 gap-y-2 flex-wrap text-foreground/80">
            <Link href='/exercises/math' className='text-sm hover:text-foreground'>
              Math
            </Link>
            <Link href='/exercises/c-test' className='text-sm hover:text-foreground'>
              C-Tests
            </Link>
            <Link href='/exercises' className='text-sm hover:text-foreground'>
              Home
            </Link>
            <Link href='/acing-aufnahmetest' className={cn(buttonVariants(), "text-foreground/80 hover:text-foreground hover:bg-foreground/5 bg-transparent border border-foreground/20")}>
              <Target className="size-5" />
              Acing Aufnahmetest
            </Link>
          </nav>
        </header>
        {children}
      </div>

    </SidebarProvider>
  )
}
