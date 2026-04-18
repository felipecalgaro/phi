'use client'

import { useSearchParams, useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react';
import { Button } from '../ui/button';
import { Check, ChevronsUpDown, Search } from 'lucide-react';
import { registerAnalyticsEvent } from '@/lib/google-analytics';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Command, CommandGroup, CommandItem, CommandList } from '../ui/command';
import { cn } from '@/lib/utils';
import stks from '@/data/exercises/studienkollegs.json';

interface ExerciseSearchFormProps {
  type: 'MATH' | 'C-TEST'
}

export function ExerciseSearchForm({ type }: ExerciseSearchFormProps) {
  const router = useRouter()
  const params = new URLSearchParams(useSearchParams().toString())

  const stkParam = params.get('studienkolleg')

  const [open, setOpen] = useState(false)
  const [selectedSTK, setSelectedSTK] = useState<string>(stkParam || '');

  function handleSearch(e: FormEvent) {
    e.preventDefault()

    params.set('studienkolleg', selectedSTK)

    const stkName = stks.find(stk => stk.id === selectedSTK)?.name || 'Unknown'

    registerAnalyticsEvent(type === 'MATH' ? 'math_search' : 'c_test_search', {
      studienkolleg: stkName,
    })

    router.push(`?${params.toString()}`, { scroll: false })
  }

  return (
    <div className='flex flex-col max-w-2xl w-full max-[360px]:px-6 px-10 bg-card text-card-foreground gap-6 rounded-xl border py-10'>
      <form onSubmit={handleSearch} className='flex justify-center items-center w-full sm:gap-8 gap-4 sm:flex-nowrap flex-wrap'>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className={cn("sm:grow grow-0 sm:w-auto w-full justify-between cursor-default font-normal has-[>svg]:p-6 hover:bg-gray-100/80 transition-[background-color]", !selectedSTK && "text-muted-foreground hover:text-muted-foreground")}
            >
              <p className='truncate'>
                {selectedSTK
                  ? stks.find((stk) => stk.id === selectedSTK)?.name
                  : "Select Studienkolleg"}
              </p>
              <ChevronsUpDown className="opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-(--radix-popover-trigger-width) p-0">
            <Command>
              <CommandList>
                <CommandGroup>
                  {stks.map((stk) => (
                    <CommandItem
                      key={stk.id}
                      value={stk.id}
                      onSelect={(currentValue) => {
                        setSelectedSTK(currentValue === selectedSTK ? "" : currentValue)
                        setOpen(false)
                      }}
                    >
                      {stk.name}
                      <Check
                        className={cn(
                          "ml-auto",
                          selectedSTK === stk.id ? "opacity-100" : "opacity-0"
                        )}
                      />
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
        <Button type='submit' className={cn('sm:w-40 w-full h-12 flex justify-center items-center gap-1.5 text-white', type === 'MATH' ? 'bg-secondary hover:bg-secondary/90' : 'bg-primary hover:bg-primary/90')} >
          <Search className='size-5' />
          Search
        </Button>
      </form>
    </div>
  )
}