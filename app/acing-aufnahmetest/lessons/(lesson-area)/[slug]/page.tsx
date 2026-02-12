import { LessonPlayer } from '@/components/acing-aufnahmetest/lesson-player'
import { LessonsSidebar } from '@/components/acing-aufnahmetest/lessons-sidebar'
import { LessonsSidebarTrigger } from '@/components/acing-aufnahmetest/lessons-sidebar-trigger'
import { MoveLeft } from 'lucide-react'
import Link from 'next/link'
import { Suspense } from 'react'

export default async function Lesson({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params

  return (
    <div className="flex flex-col bg-background min-h-screen justify-center items-center">
      <header className="h-12 flex items-center sm:px-20 xs:px-8 px-4 gap-3 shrink-0 justify-between max-w-360 w-full">
        <Link href="/acing-aufnahmetest/lessons" className="flex items-center gap-2">
          <MoveLeft className="size-5" />
        </Link>
        <span className="text-sm font-semibold text-foreground tracking-tight">
          Acing Aufnahmetest
        </span>
        <Suspense fallback={<div className='size-5' />}>
          <LessonsSidebarTrigger />
        </Suspense>
        <div className='lg:block hidden size-5' />
      </header>

      <hr className="w-full border-border" />

      <div className="flex relative flex-1 overflow-hidden md:px-12 sm:px-8 px-0 justify-center max-w-480 w-full">
        <div className="flex-1 flex flex-col min-w-0 max-w-240">
          <LessonPlayer slug={slug} />

          <div className="px-5 md:px-8 py-14 flex-1 min-h-80 flex flex-col justify-start items-start gap-1.5">
            <span className="px-2 py-0.5 rounded-full bg-primary/80 text-foreground/70 font-medium text-xs mb-3">
              MODULO
            </span>

            <h1 className="text-xl md:text-2xl font-bold text-foreground leading-tight">
              TITUERLO
            </h1>

            <p className="text-sm text-muted-foreground leading-relaxed max-w-2xl">
              In this lesson, you&apos;ll learn the key concepts and practical applications related to. Follow along with the video and try the exercises at the end.
            </p>
          </div>
        </div>
        <LessonsSidebar currentLessonSlug={slug} />
      </div>
    </div>
  )
}