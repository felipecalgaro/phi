import { LogoutButton } from '@/components/acing-aufnahmetest/logout-button';
import { Badge } from '@/components/ui/badge';
import { env } from '@/lib/env';
import prisma from '@/lib/prisma';
import { ArrowRight, BookOpen, Download, FileText, MessageCircleMore, MoveLeft, PlayCircle, Users } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { RESOURCES } from '@/data/acing-aufnahmetest/resources';
import { redirect } from 'next/navigation';
import { verifySession } from '@/lib/dal';
import { NO_INDEX_NO_FOLLOW } from '@/lib/seo';
import type { Metadata } from 'next';

type CourseLesson = {
  id: string;
  slug: string;
  title: string;
  description: string;
};

export const metadata: Metadata = {
  title: "Acing Aufnahmetest Lessons",
  description: "Private Acing Aufnahmetest course workspace for enrolled students.",
  robots: NO_INDEX_NO_FOLLOW,
};

async function getLessons(): Promise<CourseLesson[] | undefined> {
  try {
    return await prisma.lesson.findMany({
      select: {
        id: true,
        slug: true,
        title: true,
        description: true,
      },
    });
  } catch (error) {
    console.error('Failed to fetch lessons', {
      errorMessage: error instanceof Error ? error.message : 'unknown_error',
    });
  }
}

export default async function Lessons() {
  const { isAuthenticated, userRole } = await verifySession();

  if (!isAuthenticated) {
    redirect("/login");
  }

  if (userRole === "BASIC") {
    redirect("/acing-aufnahmetest/purchase");
  }

  const lessons = await getLessons();
  const resourceCount = Object.values(RESOURCES).reduce((total, files) => total + files.length, 0);

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border bg-card/85 backdrop-blur">
        <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between gap-3 px-4 sm:px-8 lg:px-12">
          <Link
            href="/acing-aufnahmetest"
            aria-label="Back to Acing Aufnahmetest"
            className="flex size-10 items-center justify-center rounded-full border border-border bg-background transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30"
          >
            <MoveLeft className="size-5" />
          </Link>
          <div className="min-w-0 text-center">
            <p className="truncate text-sm font-semibold text-foreground">
              Acing Aufnahmetest
            </p>
            <p className="hidden text-xs text-muted-foreground xs:block">
              Course workspace
            </p>
          </div>
          <LogoutButton />
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl px-4 pb-24 pt-14 sm:px-8 lg:px-12">
        <section>
          <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <Badge variant="outline" className="mb-3 rounded-full bg-card px-3 py-1 text-foreground">
                <BookOpen className="mr-1 size-3" /> Lessons
              </Badge>
              <h2 className="text-3xl font-semibold leading-tight sm:text-4xl">Course content</h2>
            </div>
            <p className="max-w-md text-sm leading-relaxed text-muted-foreground sm:text-right">
              A focused sequence for exam strategy, math, German, and practical test-day decisions.
            </p>
          </div>

          {lessons ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {lessons.map((lesson, lessonIndex) => {
                const imageUrl = `https://${env.CLOUDFRONT_DOMAIN}/video-thumbnails/${lesson.slug}.png`;

                return (
                  <Link
                    key={lesson.id}
                    href={`/acing-aufnahmetest/lessons/${lesson.slug}`}
                    className="group overflow-hidden rounded-3xl border border-border bg-card shadow-md hover:shadow-lg transition-all hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30"
                  >
                    <div className="relative aspect-video overflow-hidden bg-muted">
                      <Image
                        width={640}
                        height={360}
                        sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                        src={imageUrl}
                        alt={`${lesson.title} thumbnail`}
                        className="size-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                      />
                      <div className="absolute inset-0 bg-linear-to-t from-black/55 via-black/0 to-black/0" />
                      <div className="absolute bottom-3 left-3 flex items-center gap-2 rounded-full bg-white/90 px-3 py-1.5 text-xs font-semibold text-foreground shadow-sm">
                        <PlayCircle className="size-4" />
                        Watch lesson
                      </div>
                    </div>

                    <div className="p-5">
                      <p className="text-xs font-semibold uppercase text-muted-foreground">
                        Lesson {lessonIndex + 1}
                      </p>
                      <h4 className="mt-2 text-lg font-semibold leading-snug text-foreground">
                        {lesson.title}
                      </h4>
                      <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
                        {lesson.description}
                      </p>
                      <div className="mt-5 flex items-center gap-2 text-sm font-semibold text-foreground">
                        Open lesson
                        <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="rounded-3xl border border-border bg-card p-8 text-center shadow-sm">
              <p className="text-sm text-muted-foreground">Failed to load lessons. Please try again later.</p>
            </div>
          )}
        </section>

        <section className="mt-20 grid gap-5 lg:grid-cols-[0.75fr_1.25fr]">
          <Link
            href="/acing-aufnahmetest/community"
            className="group rounded-3xl border border-border bg-card p-6 shadow-md hover:shadow-lg transition-all hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30"
          >
            <div className="mb-6 flex size-14 items-center justify-center rounded-2xl bg-(image:--gradient-accent)">
              <MessageCircleMore className="size-7 text-foreground" />
            </div>
            <Badge variant="outline" className="mb-3 rounded-full bg-background px-3 py-1">
              <Users className="mr-1.5 size-3" /> Community
            </Badge>
            <h2 className="text-2xl font-semibold leading-tight">STK Community</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Share doubts, resources, and preparation updates with other Studienkolleg applicants.
            </p>
            <div className="mt-6 flex items-center gap-2 text-sm font-semibold">
              Open community
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
            </div>
          </Link>

          <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
            <div className="mb-6 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
              <div>
                <Badge variant="outline" className="mb-3 rounded-full bg-background px-3 py-1">
                  <FileText className="mr-1 size-3" /> Resources
                </Badge>
                <h2 className="text-2xl font-semibold leading-tight">Preparation files</h2>
              </div>
              <p className="text-sm text-muted-foreground">{resourceCount} downloadable PDFs</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              {Object.entries(RESOURCES).map(([category, files]) => (
                <div key={category}>
                  <h3 className="mb-3 text-sm font-semibold uppercase text-muted-foreground">
                    {category}
                  </h3>
                  <div className="space-y-2">
                    {files.map((file) => {
                      const fileUrl = `https://${env.CLOUDFRONT_DOMAIN}/resources/${file.slug}.pdf`;

                      return (
                        <Link
                          key={file.name}
                          href={fileUrl}
                          className="group flex items-center gap-3 rounded-2xl border border-border bg-background/60 p-3 transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30"
                        >
                          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-card">
                            <Download className="size-5 text-foreground" />
                          </span>
                          <span className="min-w-0 flex-1 text-sm font-medium leading-snug text-foreground">
                            {file.name}
                          </span>
                          <ArrowRight className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-1" />
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
