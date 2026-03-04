import { ExerciseSearchForm } from '@/components/exercises/exercise-search-form';
import { ExerciseSearchResult } from '@/components/exercises/exercise-search-result';
import { Suspense } from 'react';
import { Metadata } from 'next';
import mathExercises from '@/data/exercises/math.json';

export const metadata: Metadata = {
  title: 'Aufnahmetest - Math',
}

export default function Exercises() {
  return (
    <div className='flex justify-start items-center flex-col gap-24 pt-16 pb-40 sm:px-12 xs:px-8 px-4 w-full'>
      <h1 className='sm:text-6xl text-5xl font-bold'>Math</h1>
      <Suspense fallback={<div className='h-screen'></div>}>
        <ExerciseSearchForm type="MATH" />
        <ExerciseSearchResult type="MATH" exercises={mathExercises} />
      </Suspense>
    </div>
  )
}