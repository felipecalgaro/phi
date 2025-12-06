import mathExercises from '@/utils/math.json'
import studienkollegs from '@/utils/studienkollegs.json'
import { formatPublicId } from '@/utils/formatters'
import { TextWithLatex } from '@/components/exercises/text-with-latex'
import Link from 'next/link'
import { Metadata } from 'next'
import { ExercisesHeader } from '@/components/exercises/header'

export const metadata: Metadata = {
  title: 'Aufnahmetest - Math',
}

export async function generateStaticParams() {
  return mathExercises.map((exercise) => ({
    id: exercise.id,
  }))
}

export default async function Exercise({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const exercise = mathExercises.find(ex => ex.id === id)
  const studienkollegName = studienkollegs.find(sk => sk.id === exercise?.studienkollegId)?.name

  if (!exercise) {
    return <p>Exercise not found</p>
  }

  return (
    <>
      <ExercisesHeader className='absolute'>
        <Link href='/exercises/c-test' className='hover:underline'>
          C-Test
        </Link>
      </ExercisesHeader>
      <div className='flex flex-col items-center justify-center grow px-4 w-full h-screen bg-gray-100'>
        <div className='max-w-[1000px] w-full flex flex-col items-start gap-6'>
          <Link href="/exercises/math" className='text-start hover:underline'>
            &larr; Back to Math Exercises
          </Link>
          <div className='flex flex-col justify-center items-start w-full bg-gray-100 gap-6'>
            <div className='flex w-full min-h-80 justify-between items-start flex-col gap-12 bg-white border-2 border-gray-200/70 shadow-lg shadow-gray-200/50 rounded-lg p-8'>
              <div className='min-h-10 flex items-end justify-start gap-2 font-semibold text-lg leading-5 text-muted-foreground flex-wrap'>
                <p className='text-black text-sm mr-2'>{formatPublicId(exercise.publicId)}</p>
                <h1 className='pt-5 text-black bg-gray-100 flex items-end justify-center px-1'>{studienkollegName}</h1>
                {[exercise.season ? exercise.season.charAt(0) + exercise.season?.slice(1)?.toLowerCase() : '', exercise.year].filter(Boolean).join(' ')}
              </div>
              <div className='flex justify-start items-start w-full min-h-40'>
                <TextWithLatex>{exercise.statement}</TextWithLatex>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}