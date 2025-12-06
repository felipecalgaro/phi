'use client'

import { useSearchParams, useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react';
import { Button } from '../ui/button';
import { TopicsSelect } from './topics-select';
import { GridCard } from './grid-card';
import { Search } from 'lucide-react';
import { registerAnalyticsEvent } from '@/lib/google-analytics';

interface ExercisesSearchFormProps {
  topics: {
    id: string;
    name: string
  }[];
}

export function ExercisesSearchForm({ topics }: ExercisesSearchFormProps) {
  const router = useRouter()
  const params = new URLSearchParams(useSearchParams().toString())

  const topicsParam = params.get('topics')

  const [selectedTopicsIds, setSelectedTopicsIds] = useState<string[]>(topicsParam ? topicsParam.split(',') : []);

  function handleSearch(e: FormEvent) {
    e.preventDefault()

    params.set('topics', selectedTopicsIds.join(','))

    registerAnalyticsEvent('exercise_search', {
      topics_amount: selectedTopicsIds.length,
    })

    router.push(`?${params.toString()}`, { scroll: false })
  }

  return (
    <GridCard className='w-full flex-row justify-center items-center'>
      <form onSubmit={handleSearch} className='flex justify-center items-center w-full sm:gap-8 gap-4 sm:flex-nowrap flex-wrap'>
        <TopicsSelect className='sm:w-auto w-full grow' topics={topics} selectedTopics={selectedTopicsIds} setSelectedTopics={setSelectedTopicsIds} />
        <Button type='submit' className='bg-sky-400 hover:bg-sky-500 text-white sm:w-40 w-full h-12 flex justify-center items-center gap-1.5'>
          <Search className='size-5' />
          Search
        </Button>
      </form>
    </GridCard>
  )
}