'use client'

import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '../ui/button';
import { registerAnalyticsEvent } from '@/lib/google-analytics';
import stks from '@/data/exercises/studienkollegs.json'
import { formatPublicId } from '@/utils/formatters';
import { cn } from '@/lib/utils';

interface ExerciseSearchResultProps {
  exercises: {
    id: string
    publicId: number
    studienkollegId: string
  }[]
  type: 'MATH' | 'C-TEST'
}

export function ExerciseSearchResult({ exercises, type }: ExerciseSearchResultProps) {
  const params = useSearchParams()
  const router = useRouter()

  const stkParam = params.get('studienkolleg')

  const filteredExercises = exercises.filter(exercise => !stkParam || exercise.studienkollegId === stkParam)

  if (filteredExercises.length === 0) {
    return (
      <div className='size-full flex justify-center items-center'>
        <p className='text-gray-500'>No exercises found for the selected criteria.</p>
      </div>
    )
  }

  return (
    <div className='size-full grid grid-cols-1 md:grid-cols-2 justify-center items-center xs:gap-5 gap-3 max-w-5xl'>
      {filteredExercises.map((exercise) => (
        <Button key={exercise.id} onClick={(e) => {
          e.preventDefault()

          registerAnalyticsEvent(type === 'MATH' ? 'exercise_access_studienkolleg_B' : 'c_test_access_studienkolleg_B', {
            studienkolleg: stks.find(s => s.id === exercise.studienkollegId)?.name,
          })

          const exercisesViewed = JSON.parse(localStorage.getItem("exercisesViewed") || '[]')

          if (!exercisesViewed.includes(exercise.id)) {
            localStorage.setItem("exercisesViewed", JSON.stringify([...exercisesViewed, exercise.id]))
          }

          router.push(`/exercises/${type === 'MATH' ? 'math' : 'c-test'}/${exercise.id}`)
        }} className={cn('bg-card hover:bg-card text-card-foreground gap-6 border shadow-sm rounded-xl flex flex-col xs:p-8 p-6 justify-start items-start border-b-4 size-full', type === 'MATH' ? 'border-b-secondary' : 'border-b-primary')}>
          <h1 className='text-start font-bold sm:text-lg xs:text-base text-sm text-black truncate w-full'>
            {formatPublicId(exercise.publicId)} - {stks.find(s => s.id === exercise.studienkollegId)?.name}
          </h1>
        </Button>
      ))}
    </div>
  )
}