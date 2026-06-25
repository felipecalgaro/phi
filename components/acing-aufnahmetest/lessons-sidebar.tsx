'use client'

import { cn } from '@/lib/utils';
import { CheckCircle2, ListVideo, PlayCircle, X } from "lucide-react";
import Link from 'next/link';
import { ScrollArea } from '../ui/scroll-area';
import { type ReactNode, useContext, useEffect, useRef } from 'react';
import { LessonsSidebarContext } from './lessons-sidebar-provider';
import { useQuery } from '@tanstack/react-query';
import { getResponseDataSchema } from '@/utils/get-response-data-object';
import { z } from 'zod';
import { toast } from 'sonner';
import { Skeleton } from '../ui/skeleton';

interface LessonsSidebarProps {
  currentLessonSlug: string;
}

type LessonSummary = {
  title: string;
  slug: string;
  id: string;
};

const EMPTY_LESSONS: LessonSummary[] = [];

const lessonsSchema = getResponseDataSchema(
  z.object({
    lessons: z.array(z.object({
      title: z.string(),
      slug: z.string(),
      id: z.string(),
    })),
  }),
);

function SidebarShell({
  children,
  isOpen,
  onClose,
}: {
  children: ReactNode;
  isOpen: boolean;
  onClose: () => void;
}) {
  return (
    <>
      {isOpen ? (
        <button
          type="button"
          aria-label="Close course content"
          className="fixed inset-0 z-40 bg-black/20 backdrop-blur-[1px] lg:hidden"
          onClick={onClose}
        />
      ) : null}
      <aside
        className={cn(
          "fixed inset-y-0 right-0 z-50 h-screen w-[min(88vw,380px)] border-l border-border bg-card shadow-2xl transition-transform duration-200 lg:sticky lg:top-24 lg:z-auto lg:h-[calc(100vh-7rem)] lg:w-[360px] lg:shrink-0 lg:translate-x-0 lg:rounded-3xl lg:border lg:shadow-sm",
          isOpen ? "translate-x-0" : "translate-x-full lg:translate-x-0",
        )}
      >
        {children}
      </aside>
    </>
  );
}

function SidebarHeader({
  lessonCount,
  onClose,
}: {
  lessonCount?: number;
  onClose: () => void;
}) {
  return (
    <div className="border-b border-border p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div
            className="flex size-11 shrink-0 items-center justify-center rounded-2xl"
          >
            <ListVideo className="size-5 text-foreground" />
          </div>
          <div>
            <h2 className="text-base font-semibold leading-tight text-foreground">
              Course content
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {typeof lessonCount === 'number' ? `${lessonCount} lessons` : 'Loading lessons'}
            </p>
          </div>
        </div>
        <button
          type="button"
          aria-label="Close course content"
          className="flex size-9 items-center justify-center rounded-full border border-border bg-background transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30 lg:hidden"
          onClick={onClose}
        >
          <X className="size-4" />
        </button>
      </div>
    </div>
  );
}

export function LessonsSidebar({ currentLessonSlug }: LessonsSidebarProps) {
  const { data, isError, isPending } = useQuery({
    queryKey: ['lessons'],
    queryFn: async () => {
      let parsedResponse: z.infer<typeof lessonsSchema>;
      try {
        const response = await fetch("/api/lessons");
        parsedResponse = lessonsSchema.parse(await response.json());
      } catch {
        throw new Error("Internal server error");
      }

      if (!parsedResponse.success) {
        throw new Error(parsedResponse.error);
      }

      return parsedResponse.data;
    },
  })

  const hasShownErrorToastRef = useRef(false);

  useEffect(() => {
    if (isError && !hasShownErrorToastRef.current) {
      toast.error('Failed to load course content');
      hasShownErrorToastRef.current = true;
    }

    if (!isError) {
      hasShownErrorToastRef.current = false;
    }
  }, [isError]);

  const [isOpen, toggleIsOpen] = useContext(LessonsSidebarContext);
  const lessons = data?.lessons ?? EMPTY_LESSONS;

  const activeId = lessons.find((l) => l.slug === currentLessonSlug)?.id;
  const activeLesson = lessons.find((l) => l.slug === currentLessonSlug);

  if (isError) {
    return (
      <SidebarShell isOpen={isOpen} onClose={toggleIsOpen}>
        <SidebarHeader onClose={toggleIsOpen} />
        <div className="p-5">
          <div className="rounded-2xl border border-border bg-background/70 p-4">
            <p className="text-sm font-medium text-foreground">Course content unavailable</p>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
              Error loading course content.
            </p>
          </div>
        </div>
      </SidebarShell>
    )
  }

  if (isPending) {
    return (
      <SidebarShell isOpen={isOpen} onClose={toggleIsOpen}>
        <SidebarHeader onClose={toggleIsOpen} />
        <ScrollArea className="h-[calc(100%-82px)]">
          <div className="space-y-3 p-5">
            <Skeleton className="h-16 rounded-2xl" />
            <Skeleton className="h-12 rounded-2xl" />
            <Skeleton className="h-12 rounded-2xl" />
            <Skeleton className="h-16 rounded-2xl" />
            <Skeleton className="h-12 rounded-2xl" />
            <Skeleton className="h-12 rounded-2xl" />
          </div>
        </ScrollArea>
      </SidebarShell>
    )
  }

  return (
    <SidebarShell isOpen={isOpen} onClose={toggleIsOpen}>
      <SidebarHeader lessonCount={lessons.length} onClose={toggleIsOpen} />

      {activeLesson ? (
        <div className="border-b border-border p-5">
          <div className="flex items-start gap-3 rounded-2xl bg-background/70 p-4">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-card">
              <PlayCircle className="size-5 text-foreground" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase text-muted-foreground">
                Now playing
              </p>
              <p className="mt-1 truncate text-sm font-semibold text-foreground">
                {activeLesson.title}
              </p>
            </div>
          </div>
        </div>
      ) : null}

      <ScrollArea className={cn("h-[calc(100%-82px)]", activeLesson && "h-[calc(100%-183px)]")}>
        <div className="space-y-1.5 p-4">
          {lessons.map((lesson, lessonIndex) => {
            const isActive = lesson.id === activeId;
            return (
              <Link
                scroll={false}
                key={lesson.id}
                href={isActive ? '#' : `/acing-aufnahmetest/lessons/${lesson.slug}`}
                aria-current={isActive ? 'page' : undefined}
                onClick={() => {
                  if (isOpen) {
                    toggleIsOpen();
                  }
                }}
                className={cn(
                  "group flex w-full items-start gap-3 rounded-2xl px-3 py-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30",
                  isActive ? "bg-background shadow-sm ring-1 ring-border" : "hover:bg-background/70",
                )}
              >
                <span
                  className={cn(
                    "mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-xl text-xs font-semibold",
                    isActive ? "text-foreground" : "border border-border bg-background text-muted-foreground",
                  )}
                >
                  {isActive ? <CheckCircle2 className="size-4" /> : lessonIndex + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p
                    className={cn(
                      "text-sm leading-snug",
                      isActive ? "font-semibold text-foreground" : "font-medium text-foreground",
                    )}
                  >
                    {lesson.title}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {isActive ? 'Current lesson' : 'Open lesson'}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </ScrollArea>
    </SidebarShell>
  );
}
