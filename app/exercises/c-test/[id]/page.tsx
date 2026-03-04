import cTests from '@/data/exercises/c-tests.json'
import studienkollegs from '@/data/exercises/studienkollegs.json'
import { Metadata } from 'next'
import { ExerciseCard } from '@/components/exercises/exercise-card'

export const metadata: Metadata = {
  title: 'Aufnahmetest - C-Test',
}

export async function generateStaticParams() {
  return cTests.map((cTest) => ({
    id: cTest.id,
  }))
}

export const dynamicParams = false

export default async function CTest({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const cTest = cTests.find(ex => ex.id === id)!
  const studienkollegName = studienkollegs.find(sk => sk.id === cTest?.studienkollegId)?.name

  return (
    <main className='flex flex-col items-center justify-center grow px-4 w-full pb-32'>
      <ExerciseCard
        publicId={cTest.publicId}
        studienkollegName={studienkollegName}
        season={cTest.season}
        year={cTest.year}
      >
        <div className='flex justify-start items-start flex-col w-full min-h-40 gap-4'>
          <h1 className='text-lg font-semibold'>{cTest.title}</h1>
          <p>{cTest.text}</p>
        </div>
      </ExerciseCard>
    </main>
  )
}