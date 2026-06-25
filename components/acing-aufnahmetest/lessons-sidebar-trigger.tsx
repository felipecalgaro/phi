'use client'

import { Menu, X } from 'lucide-react'
import { useContext } from 'react';
import { LessonsSidebarContext } from './lessons-sidebar-provider';

export function LessonsSidebarTrigger() {
  const [isOpen, toggleIsOpen] = useContext(LessonsSidebarContext);

  return (
    <button
      type="button"
      aria-label={isOpen ? "Close course content" : "Open course content"}
      aria-expanded={isOpen}
      className="flex size-10 items-center justify-center rounded-full border border-border bg-background text-foreground transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30 lg:hidden"
      onClick={toggleIsOpen}
    >
      {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
    </button>
  )
}
