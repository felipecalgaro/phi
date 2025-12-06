'use client'

import { useRouter, useSearchParams } from 'next/navigation';
import { GridCard } from './grid-card';
import { Badge } from '../ui/badge';
import { formatPublicId } from '../../utils/formatters';
import { Button } from '../ui/button';
import { cn } from '@/lib/utils';
import cTests from '../../utils/c-tests.json'
import studienkollegs from '../../utils/studienkollegs.json'
import { registerAnalyticsEvent } from '@/lib/google-analytics';

export function CTestSearchResult() {
  const params = useSearchParams()
  const router = useRouter()

  const levelParam = params.get('level')

  const filteredCTests = cTests.filter(cTest => !levelParam || cTest.level === levelParam)

  return (
    <div className='flex sm:flex-row flex-col justify-center items-start w-full md:gap-5 sm:gap-3 gap-6'>
      {filteredCTests.length === 0 ? (
        <p className='text-gray-500'>No C-Tests found for the selected criteria.</p>
      ) : (
        <div className='size-full grid grid-cols-1 md:grid-cols-2 justify-center items-center xs:gap-5 gap-3'>
          {filteredCTests.map((cTest) => (
            <GridCard key={cTest.id} className={cn('gap-12 border-b-4 border-sky-400 md:max-w-[600px] max-w-full size-full')}>
              <div className='flex justify-start items-center gap-x-6 gap-y-3 flex-wrap'>
                <h1 className='flex justify-start items-center gap-3 font-bold text-lg'>
                  {formatPublicId(cTest.publicId)} - {studienkollegs.find(s => s.id === cTest.studienkollegId)?.name}
                </h1>
                <Badge>{cTest.level}</Badge>
              </div>
              <div className='flex justify-end items-center gap-x-8 gap-y-6 w-full flex-wrap'>
                <Button
                  className={cn('flex justify-center items-center gap-2 bg-sky-400 hover:bg-sky-500 w-40 text-white')}
                  onClick={(e) => {
                    e.preventDefault()

                    registerAnalyticsEvent('c_test_access_studienkolleg', {
                      studienkolleg: studienkollegs.find(s => s.id === cTest.studienkollegId)?.name,
                    })

                    const exercisesViewed = JSON.parse(localStorage.getItem("exercisesViewed") || '[]')

                    if (!exercisesViewed.includes(cTest.id)) {
                      localStorage.setItem("exercisesViewed", JSON.stringify([...exercisesViewed, cTest.id]))
                    }

                    router.push(`/exercises/c-test/${cTest.id}`)
                  }}
                >
                  Access
                </Button>
              </div>
            </GridCard>
          ))}
        </div>
      )}
    </div>
  )
}