'use client'

import { Menu, X } from 'lucide-react'
import { useContext } from 'react';
import { LessonsSidebarContext } from './lessons-sidebar-provider';

export function LessonsSidebarTrigger() {
  const [isOpen, toggleIsOpen] = useContext(LessonsSidebarContext);

  return (
    <button className="lg:hidden rounded-md hover:text-accent transition-colors text-muted-foreground cursor-pointer" onClick={toggleIsOpen}>
      {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
    </button>
  )
}