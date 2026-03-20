'use client'

import { cn } from '@/lib/utils';
import { Play } from "lucide-react";
import Link from 'next/link';
import { ScrollArea } from '../ui/scroll-area';
import { useContext, useEffect, useRef } from 'react';
import { LessonsSidebarContext } from './lessons-sidebar-provider';
import { useQuery } from '@tanstack/react-query';
import { getResponseDataSchema } from '@/utils/get-response-data-object';
import { z } from 'zod';
import { toast } from 'sonner';
import { Skeleton } from '../ui/skeleton';

interface LessonsSidebarProps {
  currentLessonSlug: string;
}

const lessonsSchema = getResponseDataSchema(
  z.object({
    lessons: z.array(z.object({
      title: z.string(),
      module: z.string(),
      slug: z.string(),
      id: z.string(),
    })),
  }),
);

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

  const [isOpen] = useContext(LessonsSidebarContext);

  if (isError) {
    return (
      <div
        className={cn("bg-white absolute inset-y-0 right-0 z-20 lg:relative lg:z-auto transition-transform duration-200", isOpen ? "translate-x-0" : "translate-x-full lg:translate-x-0")}
      >
        <p className="p-4 text-sm text-muted-foreground">Error loading course content</p>
      </div>
    )
  }

  if (isPending) {
    return (
      <div
        className={cn("bg-white absolute inset-y-0 right-0 z-20 lg:relative lg:z-auto transition-transform duration-200", isOpen ? "translate-x-0" : "translate-x-full lg:translate-x-0")}
      >
        <ScrollArea className="xl:max-h-180 lg:max-h-140 h-full lg:w-[380px] w-70 shrink-0 border-l border-border bg-card flex flex-col px-0">
          <div className="p-4">
            <h2 className="text-sm font-semibold text-foreground">Course Content</h2>
          </div>

          <Skeleton className="w-full xs:h-180 lg:h-140 h-100 mx-2" />
        </ScrollArea>
      </div>
    )
  }

  const { lessons } = data;

  const modules = [...new Set(lessons.map((l) => l.module))];
  const activeId = lessons.find((l) => l.slug === currentLessonSlug)?.id;

  return (
    <div
      className={cn("bg-white absolute inset-y-0 right-0 z-20 lg:relative lg:z-auto transition-transform duration-200", isOpen ? "translate-x-0" : "translate-x-full lg:translate-x-0")}
    >
      <ScrollArea className="xl:max-h-180 lg:max-h-140 h-full lg:w-[380px] w-70 shrink-0 border-l border-border bg-card flex flex-col px-0">
        <div className="p-4 border-b border-border">
          <h2 className="text-sm font-semibold text-foreground">Course Content</h2>
        </div>

        <div className="flex-1 py-2">
          {modules.map((mod) => (
            <div key={mod}>
              <div className="px-4 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground bg-background/50">
                {mod}
              </div>
              {lessons
                .filter((l) => l.module === mod)
                .map((lesson) => {
                  const isActive = lesson.id === activeId;
                  return (
                    <Link
                      scroll={false}
                      key={lesson.id}
                      href={isActive ? '#' : `/acing-aufnahmetest/lessons/${lesson.slug}`}
                      className={cn("w-full flex items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-accent/10", isActive ? "bg-accent/10 border-l-2 border-l-primary" : "")}
                    >
                      <div className="mt-0.5 shrink-0">
                        {isActive && (
                          <Play className="h-4 w-4 text-primary fill-primary" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p
                          className={cn("text-sm leading-snug truncate", isActive ? "text-foreground font-medium" : "text-primary-foreground")}
                        >
                          {lesson.title}
                        </p>
                      </div>
                    </Link>
                  );
                })}
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
