import type { Metadata } from "next";
import {
  COURSE_DESCRIPTION,
  COURSE_IMAGE_PATH,
  COURSE_KEYWORDS,
  COURSE_PATH,
  createPageMetadata,
} from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Acing Aufnahmetest",
  description: COURSE_DESCRIPTION,
  path: COURSE_PATH,
  keywords: COURSE_KEYWORDS,
  image: {
    path: COURSE_IMAGE_PATH,
    alt: "Acing Aufnahmetest course preview",
    width: 1200,
    height: 675,
  },
});

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
