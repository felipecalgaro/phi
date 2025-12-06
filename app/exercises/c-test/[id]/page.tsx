import cTests from '@/utils/c-tests.json'
import studienkollegs from '@/utils/studienkollegs.json'
import { formatPublicId } from '@/utils/formatters'
import Link from 'next/link'
import { Metadata } from 'next'
import { ExercisesHeader } from '@/components/exercises/header'

export const metadata: Metadata = {
  title: 'Aufnahmetest - C-Test',
}

export async function generateStaticParams() {
  return cTests.map((cTest) => ({
    id: cTest.id,
  }))
}

export default async function CTest({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const cTest = cTests.find(ex => ex.id === id)
  const studienkollegName = studienkollegs.find(sk => sk.id === cTest?.studienkollegId)?.name

  if (!cTest) {
    return <p>C-Test not found</p>
  }

  return (
    <>
      <ExercisesHeader className='absolute'>
        <Link href='/exercises/math' className='hover:underline'>
          Math
        </Link>
      </ExercisesHeader>
      <div className='flex flex-col items-center justify-center grow px-4 w-full h-screen bg-gray-100'>
        <div className='max-w-[1000px] w-full flex flex-col items-start gap-6'>
          <Link href="/exercises/c-test" className='text-start hover:underline'>
            &larr; Back to C-Tests
          </Link>
          <div className='flex flex-col justify-center items-start w-full grow bg-gray-100 gap-6'>
            <div className='flex w-full min-h-80 justify-between items-start flex-col gap-12 bg-white border-2 border-gray-200/70 shadow-lg shadow-gray-200/50 rounded-lg p-8'>
              <div className='min-h-10 flex items-end justify-start gap-2 font-semibold text-lg leading-5 text-muted-foreground flex-wrap'>
                <p className='text-black text-sm mr-2'>{formatPublicId(cTest.publicId)}</p>
                <h1 className='pt-5 text-black bg-gray-100 flex items-end justify-center px-1'>{studienkollegName}</h1>
                {[cTest.season ? cTest.season.charAt(0) + cTest.season?.slice(1)?.toLowerCase() : '', cTest.year].filter(Boolean).join(' ')}
              </div>
              <div className='flex justify-start items-start flex-col w-full min-h-40 gap-4'>
                <h1 className='text-lg font-semibold'>{cTest.title}</h1>
                <p>{cTest.text}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}