'use client'

import { cn } from '@/lib/utils';
import { Play } from "lucide-react";
import Link from 'next/link';
import { ScrollArea } from '../ui/scroll-area';
import { useContext } from 'react';
import { LessonsSidebarContext } from './lessons-sidebar-provider';

interface LessonsSidebarProps {
  currentLessonSlug: string;
  lessons: {
    id: number;
    title: string;
    module: string;
    slug: string;
  }[]
}

export function LessonsSidebar({ currentLessonSlug, lessons }: LessonsSidebarProps) {
  const modules = [...new Set(lessons.map((l) => l.module))];
  const activeId = lessons.find((l) => l.slug === currentLessonSlug)?.id;

  const [isOpen] = useContext(LessonsSidebarContext);

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
