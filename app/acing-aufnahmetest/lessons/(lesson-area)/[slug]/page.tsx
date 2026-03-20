import { LessonsSidebar } from '@/components/acing-aufnahmetest/lessons-sidebar'
import { LessonsSidebarTrigger } from '@/components/acing-aufnahmetest/lessons-sidebar-trigger'
import { MoveLeft } from 'lucide-react'
import Link from 'next/link'
import { Suspense } from 'react'
import prisma from '@/lib/prisma';
import { notFound, redirect } from 'next/navigation'
import { getSignedLessonVideoUrl } from '@/utils/get-signed-lesson-video-url'
import { verifySession } from '@/lib/dal'
import { LessonVideoPlayer } from '@/components/acing-aufnahmetest/lesson-video-player'

async function getVideoUrl(slug: string) {
  const { isAuthenticated, userRole } = await verifySession();

  if (!isAuthenticated) {
    redirect("/acing-aufnahmetest/login");
  }

  if (userRole === "BASIC") {
    redirect("/acing-aufnahmetest/purchase");
  }

  try {
    return getSignedLessonVideoUrl(slug);
  } catch (error) {
    console.error('Failed to sign lesson video URL', {
      slug,
      errorMessage: error instanceof Error ? error.message : 'unknown_error',
    });
    return
  }
}

export default async function Lesson({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params

  const lesson = await prisma.lesson.findUnique({
    where: {
      slug,
    },
    select: {
      title: true,
      description: true,
      module: true,
    },
  })

  const signedVideoUrl = await getVideoUrl(slug);

  if (!lesson) {
    return notFound()
  }

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
          {signedVideoUrl ? (
            <LessonVideoPlayer slug={slug} initialSignedUrl={signedVideoUrl.url} initialExpiresAt={signedVideoUrl.expiresAt} />
          ) : (
            <div className='bg-black/80 aspect-video w-full flex items-center justify-center'>
              <p className="text-white font-medium">Failed to load video</p>
            </div>
          )}

          <div className="px-5 md:px-8 py-14 flex-1 min-h-80 flex flex-col justify-start items-start gap-1.5">
            <span className="px-2 py-0.5 rounded-full bg-primary/80 text-foreground/70 font-medium text-xs mb-3">
              {lesson.module}
            </span>

            <h1 className="text-xl md:text-2xl font-bold text-foreground leading-tight">
              {lesson.title}
            </h1>

            <p className="text-sm text-muted-foreground leading-relaxed max-w-2xl">
              {lesson.description}
            </p>
          </div>
        </div>
        <LessonsSidebar currentLessonSlug={slug} />
      </div>
    </div>
  )
}