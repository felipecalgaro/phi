'use client'

import { lessons } from '@/data/lessons';
import { cn } from '@/lib/utils';
import { Play, CheckCircle2, Circle, Clock } from "lucide-react";
import Link from 'next/link';
import { ScrollArea } from '../ui/scroll-area';
import { useContext } from 'react';
import { LessonsSidebarContext } from './lessons-sidebar-provider';

interface LessonsSidebarProps {
  currentLessonSlug: string;
}

export function LessonsSidebar({ currentLessonSlug }: LessonsSidebarProps) {
  const modules = [...new Set(lessons.map((l) => l.module))];
  const completed = lessons.filter((l) => l.completed).length;
  const progress = Math.round((completed / lessons.length) * 100);
  const activeId = lessons.find((l) => l.slug === currentLessonSlug)?.id;

  const [isOpen] = useContext(LessonsSidebarContext);

  return (
    <div
      className={cn("bg-white absolute inset-y-0 right-0 z-20 lg:relative lg:z-auto transition-transform duration-200", isOpen ? "translate-x-0" : "translate-x-full lg:translate-x-0")}
    >
      <ScrollArea className="xl:max-h-180 lg:max-h-140 h-full lg:w-[380px] w-70 shrink-0 border-l border-border bg-card flex flex-col px-0">
        <div className="p-4 border-b border-border">
          <h2 className="text-sm font-semibold text-foreground">Course Content</h2>
          <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
            <span>{completed}/{lessons.length} completed</span>
            <span>·</span>
            <span>{progress}%</span>
          </div>
          <div className="mt-2 h-1 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full bg-primary transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
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
                      href={`/acing-aufnahmetest/lessons/${lesson.slug}`}
                      className={cn("w-full flex items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-accent/10", isActive ? "bg-accent/10 border-l-2 border-l-primary" : "")}
                    >
                      <div className="mt-0.5 shrink-0">
                        {lesson.completed ? (
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                        ) : isActive ? (
                          <Play className="h-4 w-4 text-primary fill-primary" />
                        ) : (
                          <Circle className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p
                          className={cn("text-sm leading-snug truncate", isActive ? "text-foreground font-medium" : "text-primary-foreground")}
                        >
                          {lesson.title}
                        </p>
                        <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          <span>{lesson.duration}</span>
                        </div>
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
