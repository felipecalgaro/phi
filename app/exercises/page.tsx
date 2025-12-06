import Link from 'next/link'
import { GridCard } from '../../components/exercises/grid-card'
import { Calculator, FileText } from 'lucide-react'
import { ExercisesHeader } from '@/components/exercises/header'

export default async function Home() {
  return (
    <>
      <ExercisesHeader>
        <Link href='/exercises/math' className='hover:underline'>
          Math
        </Link>
        <Link href='/exercises/c-test' className='hover:underline'>
          C-Test
        </Link>
      </ExercisesHeader>
      <main className="flex flex-col items-center justify-start gap-24 py-16 sm:px-12 xs:px-8 px-4 bg-gray-100">
        <h1 className="sm:text-6xl text-5xl font-bold">Aufnahmetest Exercises</h1>
        <div className="flex flex-col gap-4 w-full max-w-2xl">
          <Link href="/exercises/math">
            <GridCard>
              <div className="flex items-center gap-4">
                <div className="bg-primary/10 text-primary rounded-lg p-2">
                  <Calculator className="size-5 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-medium">Math exercises</h3>
                </div>
              </div>
            </GridCard>
          </Link>
          <Link href="/exercises/c-test">
            <GridCard>
              <div className="flex items-center gap-4">
                <div className="bg-primary/10 text-primary rounded-lg p-2">
                  <FileText className="size-5 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-medium">C-Tests</h3>
                </div>
              </div>
            </GridCard>
          </Link>
        </div>
      </main>
    </>
  )
}