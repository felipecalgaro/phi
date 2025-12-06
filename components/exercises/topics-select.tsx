'use client'

import { MultiSelect } from './multi-select';

interface TopicsSelectProps {
  topics: { id: string; name: string }[];
  selectedTopics: string[];
  setSelectedTopics: (selectedTopics: string[]) => void;
  className?: string;
}

export function TopicsSelect({ selectedTopics, setSelectedTopics, topics, className }: TopicsSelectProps) {
  return (
    <MultiSelect className={className} placeholder='Select the topics (max.: 3)' options={topics} setState={(topics) => {
      if (topics.length > 3) return

      setSelectedTopics(topics)
    }} state={selectedTopics} />
  )
}