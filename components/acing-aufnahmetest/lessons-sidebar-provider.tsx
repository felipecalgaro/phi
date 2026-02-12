'use client'

import { createContext, ReactNode, useState } from "react";

export const LessonsSidebarContext = createContext<[boolean, () => void]>([false, () => { }]);

export function LessonsSidebarProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <LessonsSidebarContext.Provider value={[isOpen, () => setIsOpen(prev => !prev)]}>
      {children}
    </LessonsSidebarContext.Provider>
  )
}
