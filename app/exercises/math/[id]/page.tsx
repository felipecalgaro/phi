import mathExercises from '@/data/exercises/math.json'
import studienkollegs from '@/data/exercises/studienkollegs.json'
import { Metadata } from 'next'
import { ExerciseCard } from '@/components/exercises/exercise-card'
import { TextWithLatex } from '@/components/exercises/text-with-latex'

export const metadata: Metadata = {
  title: 'Aufnahmetest - Math',
}

export async function generateStaticParams() {
  return mathExercises.map((exercise) => ({
    id: exercise.id,
  }))
}

export const dynamicParams = false

export default async function Exercise({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const exercise = mathExercises.find(ex => ex.id === id)!
  const studienkollegName = studienkollegs.find(sk => sk.id === exercise?.studienkollegId)?.name

  return (
    <main className='flex flex-col items-center justify-center grow px-4 w-full pb-32'>
      <ExerciseCard
        publicId={exercise.publicId}
        studienkollegName={studienkollegName}
        season={exercise.season}
        year={exercise.year}
      >
        {exercise.statement.split('\n\n').map((paragraph, index) => {
          if (paragraph.startsWith('- ')) {
            const items = paragraph.split('\n');
            return (
              <ul key={index} className="list-disc list-inside space-y-2 my-4 text-foreground/90">
                {items.map((item, i) => (
                  <li key={i}>
                    <TextWithLatex>{item.replace('- ', '')}</TextWithLatex>
                  </li>
                ))}
              </ul>
            );
          } else {
            return (
              <TextWithLatex key={index} className='text-foreground/90 leading-relaxed my-4'>{paragraph}</TextWithLatex>
            );
          }
        })}
      </ExerciseCard>
    </main>
  )
}