import { ExerciseSearchResult } from '@/components/exercises/exercise-search-result';
import { ExerciseSearchForm } from '@/components/exercises/exercise-search-form';
import type { Metadata } from 'next';
import { Suspense } from 'react';
import cTests from '@/data/exercises/c-tests.json';
import {
  C_TEST_EXERCISES_DESCRIPTION,
  C_TEST_EXERCISES_PATH,
  EXERCISES_KEYWORDS,
  EXERCISES_PATH,
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
  title: "Aufnahmetest C-Test Exercises",
  description: C_TEST_EXERCISES_DESCRIPTION,
  path: C_TEST_EXERCISES_PATH,
  keywords: EXERCISES_KEYWORDS,
  image: {
    path: "/passing-exam.png",
    alt: "Studienkolleg Aufnahmetest C-Test exercises preview",
  },
});

export default function Exercises() {
  const jsonLd = createJsonLdGraph([
    createOrganizationJsonLd(),
    createWebSiteJsonLd(),
    createWebPageJsonLd({
      path: C_TEST_EXERCISES_PATH,
      title: "Aufnahmetest C-Test Exercises",
      description: C_TEST_EXERCISES_DESCRIPTION,
      imagePath: "/passing-exam.png",
    }),
    createBreadcrumbJsonLd([
      { name: "Home", path: "/" },
      { name: "Exercises", path: EXERCISES_PATH },
      { name: "C-Tests", path: C_TEST_EXERCISES_PATH },
    ]),
    ...createCollectionPageJsonLd({
      path: C_TEST_EXERCISES_PATH,
      title: "Aufnahmetest C-Test Exercises",
      description: C_TEST_EXERCISES_DESCRIPTION,
      itemCount: cTests.length,
    }),
  ]);

  return (
    <div className='flex justify-start items-center flex-col gap-24 pt-16 pb-40 sm:px-12 xs:px-8 px-4 w-full'>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: stringifyJsonLd(jsonLd),
        }}
      />
      <h1 className='sm:text-6xl text-5xl font-bold'>C-Tests</h1>
      <Suspense fallback={<div className='h-screen'></div>}>
        <ExerciseSearchForm type="C-TEST" />
        <ExerciseSearchResult type="C-TEST" exercises={cTests} />
      </Suspense>
    </div>
  )
}
