import { ExerciseSearchForm } from '@/components/exercises/exercise-search-form';
import { ExerciseSearchResult } from '@/components/exercises/exercise-search-result';
import { Suspense } from 'react';
import type { Metadata } from 'next';
import mathExercises from '@/data/exercises/math.json';
import {
  EXERCISES_PATH,
  EXERCISES_KEYWORDS,
  MATH_EXERCISES_DESCRIPTION,
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
  title: "Aufnahmetest Math Exercises",
  description: MATH_EXERCISES_DESCRIPTION,
  path: MATH_EXERCISES_PATH,
  keywords: EXERCISES_KEYWORDS,
  image: {
    path: "/passing-exam.png",
    alt: "Studienkolleg Aufnahmetest math exercises preview",
  },
});

export default function Exercises() {
  const jsonLd = createJsonLdGraph([
    createOrganizationJsonLd(),
    createWebSiteJsonLd(),
    createWebPageJsonLd({
      path: MATH_EXERCISES_PATH,
      title: "Aufnahmetest Math Exercises",
      description: MATH_EXERCISES_DESCRIPTION,
      imagePath: "/passing-exam.png",
    }),
    createBreadcrumbJsonLd([
      { name: "Home", path: "/" },
      { name: "Exercises", path: EXERCISES_PATH },
      { name: "Math", path: MATH_EXERCISES_PATH },
    ]),
    ...createCollectionPageJsonLd({
      path: MATH_EXERCISES_PATH,
      title: "Aufnahmetest Math Exercises",
      description: MATH_EXERCISES_DESCRIPTION,
      itemCount: mathExercises.length,
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
      <h1 className='sm:text-6xl text-5xl font-bold'>Math</h1>
      <Suspense fallback={<div className='h-screen'></div>}>
        <ExerciseSearchForm type="MATH" />
        <ExerciseSearchResult type="MATH" exercises={mathExercises} />
      </Suspense>
    </div>
  )
}
