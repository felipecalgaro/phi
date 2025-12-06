import type { Metadata } from "next";
import { FeedbackDialog } from '@/components/exercises/feedback-dialog';
import { Toaster } from '@/components/ui/sonner';

export const metadata: Metadata = {
  title: "Aufnahmetest Exercises",
  description: "A collection of math exercises and C-tests for the Studienkolleg Aufnahmetest",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      {children}
      <FeedbackDialog />
      <Toaster richColors />
    </>
  )
}
