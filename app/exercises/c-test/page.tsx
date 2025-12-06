import { CTestSearchForm } from '@/components/exercises/c-test-search-form';
import { CTestSearchResult } from '@/components/exercises/c-test-search-result';
import { ExercisesHeader } from '@/components/exercises/header';
import { NPSDialog } from '@/components/exercises/nps-dialog';
import { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';

export const metadata: Metadata = {
  title: 'Aufnahmetest - C-Test',
}

export default function Exercises() {
  return (
    <>
      <ExercisesHeader>
        <Link href='/exercises/math' className='hover:underline'>
          Math
        </Link>
      </ExercisesHeader>
      <div className='flex justify-start items-center flex-col gap-24 pt-16 pb-32 sm:px-12 xs:px-8 px-4 bg-gray-100'>
        <h1 className='sm:text-6xl text-5xl font-bold'>C-Tests</h1>
        <div className='flex flex-col gap-16 justify-center items-center max-w-[1000px] w-full'>
          <Suspense>
            <CTestSearchForm />
            <CTestSearchResult />
          </Suspense>
          <NPSDialog />
        </div>
      </div>
    </>
  )
}