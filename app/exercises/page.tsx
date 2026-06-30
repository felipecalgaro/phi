import Link from 'next/link'
import { Calculator, FileText, Target } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Metadata } from 'next';
import {
  C_TEST_EXERCISES_PATH,
  EXERCISES_DESCRIPTION,
  EXERCISES_IMAGE_PATH,
  EXERCISES_KEYWORDS,
  EXERCISES_PATH,
  MATH_EXERCISES_PATH,
  createBreadcrumbJsonLd,
  createCollectionPageJsonLd,
  createJsonLdGraph,
  createOrganizationJsonLd,
  createPageMetadata,
  createWebPageJsonLd,
  createWebSiteJsonLd,
  stringifyJsonLd,
} from '@/lib/seo';

export const metadata: Metadata = createPageMetadata({
  title: "Aufnahmetest Exercises",
  description: EXERCISES_DESCRIPTION,
  path: EXERCISES_PATH,
  keywords: EXERCISES_KEYWORDS,
  image: {
    path: EXERCISES_IMAGE_PATH,
    alt: "Aufnahmetest practice exercises preview",
  },
});

const links = [
  {
    title: "Math exercises",
    href: "/exercises/math",
    icon: Calculator,
    background: "bg-secondary/40"
  },
  {
    title: "C-Tests",
    href: "/exercises/c-test",
    icon: FileText,
    background: "bg-primary/40"
  },
  {
    title: "Aufnahmetest Course",
    href: '/acing-aufnahmetest',
    icon: Target,
    background: "bg-black/10"
  }
]

export default async function Home() {
  const exerciseCategories = [
    { name: "Math exercises", path: MATH_EXERCISES_PATH },
    { name: "C-Tests", path: C_TEST_EXERCISES_PATH },
  ];
  const jsonLd = createJsonLdGraph([
    createOrganizationJsonLd(),
    createWebSiteJsonLd(),
    createWebPageJsonLd({
      path: EXERCISES_PATH,
      title: "Aufnahmetest Exercises",
      description: EXERCISES_DESCRIPTION,
      imagePath: EXERCISES_IMAGE_PATH,
    }),
    createBreadcrumbJsonLd([
      { name: "Home", path: "/" },
      { name: "Exercises", path: EXERCISES_PATH },
    ]),
    ...createCollectionPageJsonLd({
      path: EXERCISES_PATH,
      title: "Aufnahmetest Exercises",
      description: EXERCISES_DESCRIPTION,
      items: exerciseCategories,
    }),
  ]);

  return (
    <main className="flex flex-col items-center justify-start gap-24 py-16 sm:px-12 xs:px-8 px-4 mb-40">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: stringifyJsonLd(jsonLd),
        }}
      />
      <h1 className="sm:text-6xl text-4xl text-center font-bold">Aufnahmetest Exercises</h1>
      <div className="flex flex-col gap-4 w-full max-w-2xl">
        {links.map(({ title, href, icon: Icon, background }, index) => (
          <Link href={href} key={index} className='max-[360px]:px-6 px-10 bg-card text-card-foreground flex flex-col gap-6 rounded-xl border py-6'>
            <div className="flex items-center gap-4">
              <div className={cn(background, "rounded-lg p-2")}>
                <Icon className="size-5" />
              </div>
              <div>
                <h3 className="text-lg font-medium">{title}</h3>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </main>
  )
}
