import { LessonsSidebar } from '@/components/acing-aufnahmetest/lessons-sidebar'
import { LessonsSidebarTrigger } from '@/components/acing-aufnahmetest/lessons-sidebar-trigger'
import { Badge } from '@/components/ui/badge'
import { MoveLeft, PlayCircle } from 'lucide-react'
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
    },
  })

  if (!lesson) {
    return notFound()
  }

  const signedVideoUrl = await getVideoUrl(slug);

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border bg-card/85 backdrop-blur">
        <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between gap-3 px-4 sm:px-8 lg:px-12">
          <Link
            href="/acing-aufnahmetest/lessons"
            aria-label="Back to lessons"
            className="flex size-10 items-center justify-center rounded-full border border-border bg-background transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30"
          >
            <MoveLeft className="size-5" />
          </Link>
          <div className="min-w-0 text-center">
            <p className="truncate text-sm font-semibold text-foreground">
              Acing Aufnahmetest
            </p>
            <p className="hidden text-xs text-muted-foreground xs:block">
              Lesson workspace
            </p>
          </div>
          <Suspense fallback={<div className="size-10" />}>
            <LessonsSidebarTrigger />
          </Suspense>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-7xl gap-6 px-4 pb-14 pt-6 sm:px-8 lg:px-12">
        <section className="min-w-0 flex-1">
          <div className="overflow-hidden rounded-3xl border border-border bg-card p-2 shadow-sm">
            {signedVideoUrl ? (
              <LessonVideoPlayer slug={slug} initialSignedUrl={signedVideoUrl.url} initialExpiresAt={signedVideoUrl.expiresAt} />
            ) : (
              <div className="flex aspect-video w-full items-center justify-center rounded-2xl bg-black/85">
                <p className="text-sm font-medium text-white">Failed to load video</p>
              </div>
            )}
          </div>

          <div className="mt-5 rounded-3xl border border-border bg-card p-6 shadow-sm sm:p-8">
            <Badge variant="outline" className="mb-4 rounded-full bg-background px-3 py-1 text-foreground">
              <PlayCircle className="mr-1 size-3" /> Video lesson
            </Badge>

            <h1 className="max-w-3xl text-3xl font-semibold leading-tight sm:text-4xl">
              {lesson.title}
            </h1>

            <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground">
              {lesson.description}
            </p>
          </div>
        </section>

        <LessonsSidebar currentLessonSlug={slug} />
      </main>
    </div>
  )
}
