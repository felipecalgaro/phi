import { formatPublicId, formatSeasonAndYear } from '@/utils/formatters';
import { Card, CardHeader, CardContent } from '../ui/card';
import { ReactNode } from 'react';

interface ExerciseCardProps {
  publicId: number;
  studienkollegName: string | undefined;
  season: string | null;
  year: number | null;
  children: ReactNode;
}

export function ExerciseCard({ publicId, studienkollegName, season, year, children }: ExerciseCardProps) {
  return (
    <Card className="max-w-250 min-h-80 justify-start items-start gap-6 sm:px-8 px-6 py-10 w-full">
      <CardHeader className='w-full sm:px-6 px-2'>
        <div className='flex xs:flex-row flex-col gap-4 xs:items-end items-start justify-start text-lg text-foreground flex-wrap'>
          <div className='leading-tight flex justify-start items-start xs:flex-row flex-col xs:grow grow-0 xs:w-auto w-full gap-x-2 gap-y-1 xs:bg-stone-100 bg-transparent'>
            <p className='bg-stone-100'>{studienkollegName}</p> <p className='bg-stone-100 whitespace-nowrap w-min'>{formatSeasonAndYear(season, year)} <span className='text-xs'>{formatPublicId(publicId)}</span></p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="justify-start items-start w-full sm:px-6 px-2">
        {children}
      </CardContent>
    </Card>
  )
}