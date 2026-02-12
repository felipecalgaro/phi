import { LessonsSidebarProvider } from '@/components/acing-aufnahmetest/lessons-sidebar-provider';

export default async function LessonLayout({ children }: { children: React.ReactNode }) {
  return (
    <LessonsSidebarProvider>
      {children}
    </LessonsSidebarProvider>
  )
}