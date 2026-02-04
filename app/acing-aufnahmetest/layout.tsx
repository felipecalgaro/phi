import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Acing Aufnahmetest",
  description: "Comprehensive course designed to help you pass your Studienkolleg entrance exam.",
};

export default function CourseLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      {children}
    </>
  )
}
