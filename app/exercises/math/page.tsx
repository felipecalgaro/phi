import { ExercisesSearchForm } from '@/components/exercises/exercise-search-form';
import { ExercisesSearchResult } from '@/components/exercises/exercises-search-result';
import { Suspense } from 'react';
import topics from '../../../utils/topics.json';
import { Metadata } from 'next';
import { NPSDialog } from '@/components/exercises/nps-dialog';
import { ExercisesHeader } from '@/components/exercises/header';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Aufnahmetest - Math',
}

export default function Exercises() {
  return (
    <>
      <ExercisesHeader>
        <Link href='/exercises/c-test' className='hover:underline'>
          C-Test
        </Link>
      </ExercisesHeader>
      <div className='flex justify-start items-center flex-col gap-24 pt-16 pb-32 sm:px-12 xs:px-8 px-4 bg-gray-100'>
        <h1 className='sm:text-6xl text-5xl font-bold'>Math</h1>
        <div className='flex flex-col gap-16 justify-center items-center max-w-[800px] w-full'>
          <Suspense>
            <ExercisesSearchForm topics={topics} />
            <ExercisesSearchResult />
          </Suspense>
          <NPSDialog />
        </div>
      </div>
    </>
  )
}