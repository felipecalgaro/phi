import { LessonsSidebarProvider } from '@/components/acing-aufnahmetest/lessons-sidebar-provider';
import { NO_INDEX_NO_FOLLOW } from '@/lib/seo';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Acing Aufnahmetest Lesson",
  description: "Private Acing Aufnahmetest video lesson for enrolled students.",
  robots: NO_INDEX_NO_FOLLOW,
};

export default async function LessonLayout({ children }: { children: React.ReactNode }) {
  return (
    <LessonsSidebarProvider>
      {children}
    </LessonsSidebarProvider>
  )
}
