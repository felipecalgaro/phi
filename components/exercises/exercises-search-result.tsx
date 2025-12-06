'use client'

import { useRouter, useSearchParams } from 'next/navigation';
import { GridCard } from './grid-card';
import { Badge } from '../ui/badge';
import { formatPublicId } from '../../utils/formatters';
import { Button } from '../ui/button';
import { cn } from '@/lib/utils';
import mathExercises from '../../utils/math.json'
import topics from '../../utils/topics.json';
import studienkollegs from '../../utils/studienkollegs.json'
import { registerAnalyticsEvent } from '@/lib/google-analytics';

export function ExercisesSearchResult() {
  const params = useSearchParams()
  const router = useRouter()

  const topicsParam = params.get('topics')

  const filteredExercises = mathExercises.filter(exercise => !topicsParam || topicsParam?.split(',').every((topicId: string) => exercise.topicsIds.includes(topicId)))

  return (
    <div className='flex sm:flex-row flex-col justify-center items-start w-full md:gap-5 sm:gap-3 gap-6'>
      {filteredExercises.length === 0 ? (
        <p className='text-gray-500'>No exercises found for the selected criteria.</p>
      ) : (
        <div className='flex flex-col w-full gap-16'>
          <div className='size-full grid lg:grid-cols-2 grid-cols-1 xs:gap-5 gap-3'>
            {filteredExercises.map((exercise) => (
              <GridCard key={exercise.id} className={cn('lg:min-h-60 min-h-[200px] gap-12 border-b-4 border-sky-400')}>
                <div className='flex flex-col justify-center items-start gap-4'>
                  <h1 className='flex justify-start items-center gap-3 font-bold text-lg'>
                    {formatPublicId(exercise.publicId)} - {studienkollegs.find(s => s.id === exercise.studienkollegId)?.name}
                  </h1>
                  <div className='flex flex-wrap justify-start items-center gap-x-4 gap-y-3'>
                    {exercise.topicsIds.map(topicId => (
                      <Badge variant='outline' key={topicId}>{topics.find(t => t.id === topicId)?.name}</Badge>
                    ))}
                  </div>
                </div>
                <div className='flex justify-end items-center gap-x-8 gap-y-6 w-full flex-wrap'>
                  <Button
                    className={cn('flex justify-center items-center gap-2 bg-sky-400 hover:bg-sky-500 text-white w-full max-w-[400px]')}
                    onClick={(e) => {
                      e.preventDefault()

                      registerAnalyticsEvent('exercise_access_studienkolleg', {
                        studienkolleg: studienkollegs.find(s => s.id === exercise.studienkollegId)?.name,
                      })

                      const exercisesViewed = JSON.parse(localStorage.getItem("exercisesViewed") || '[]')

                      if (!exercisesViewed.includes(exercise.id)) {
                        localStorage.setItem("exercisesViewed", JSON.stringify([...exercisesViewed, exercise.id]))
                      }

                      router.push(`/exercises/math/${exercise.id}`)
                    }}
                  >
                    Access
                  </Button>
                </div>
              </GridCard>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}