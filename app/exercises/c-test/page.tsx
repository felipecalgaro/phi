import { ExerciseSearchResult } from '@/components/exercises/exercise-search-result';
import { ExerciseSearchForm } from '@/components/exercises/exercise-search-form';
import { Metadata } from 'next';
import { Suspense } from 'react';
import cTests from '@/data/exercises/c-tests.json';

export const metadata: Metadata = {
  title: 'Aufnahmetest - C-Test',
}

export default function Exercises() {
  return (
    <div className='flex justify-start items-center flex-col gap-24 pt-16 pb-40 sm:px-12 xs:px-8 px-4 w-full'>
      <h1 className='sm:text-6xl text-5xl font-bold'>C-Tests</h1>
      <Suspense fallback={<div className='h-screen'></div>}>
        <ExerciseSearchForm type="C-TEST" />
        <ExerciseSearchResult type="C-TEST" exercises={cTests} />
      </Suspense>
    </div>
  )
}