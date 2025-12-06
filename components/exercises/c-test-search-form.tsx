'use client'

import { useSearchParams, useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react';
import { Button } from '../ui/button';
import { GridCard } from './grid-card';
import { Check, ChevronsUpDown, Search } from 'lucide-react';
import { registerAnalyticsEvent } from '@/lib/google-analytics';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList } from '../ui/command';
import { cn } from '@/lib/utils';

const LEVELS = [
  'B1',
  'B2',
  'C1',
]

export function CTestSearchForm() {
  const router = useRouter()
  const params = new URLSearchParams(useSearchParams().toString())

  const levelParam = params.get('level')

  const [open, setOpen] = useState(false)
  const [selectedLevel, setSelectedLevel] = useState<string>(levelParam || '');

  function handleSearch(e: FormEvent) {
    e.preventDefault()

    params.set('level', selectedLevel)

    registerAnalyticsEvent('exercise_search', {
      level: levelParam,
    })

    router.push(`?${params.toString()}`, { scroll: false })
  }

  return (
    <GridCard className='flex-row justify-center items-center sm:max-w-lg max-w-[440px] w-full'>
      <form onSubmit={handleSearch} className='flex justify-center items-center w-full sm:gap-8 gap-4 sm:flex-nowrap flex-wrap'>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className={cn("grow justify-between cursor-default font-normal has-[>svg]:p-6 hover:bg-accent transition-[background-color]", !selectedLevel && "text-muted-foreground hover:text-muted-foreground")}
            >
              {selectedLevel
                ? LEVELS.find((level) => level === selectedLevel)
                : "Select German Level"}
              <ChevronsUpDown className="opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64 p-0">
            <Command>
              <CommandList>
                <CommandEmpty>No framework found.</CommandEmpty>
                <CommandGroup>
                  {LEVELS.map((level) => (
                    <CommandItem
                      key={level}
                      value={level}
                      onSelect={(currentValue) => {
                        setSelectedLevel(currentValue === selectedLevel ? "" : currentValue)
                        setOpen(false)
                      }}
                    >
                      {level}
                      <Check
                        className={cn(
                          "ml-auto",
                          selectedLevel === level ? "opacity-100" : "opacity-0"
                        )}
                      />
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
        <Button type='submit' className='bg-sky-400 hover:bg-sky-500 text-white sm:w-40 w-full h-12 flex justify-center items-center gap-1.5'>
          <Search className='size-5' />
          Search
        </Button>
      </form>
    </GridCard>
  )
}