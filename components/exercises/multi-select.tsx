"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandGroup, CommandItem } from "@/components/ui/command";
import { CheckIcon, ChevronDownIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface MultiSelectProps {
  options: {
    name: string;
    id: string;
  }[] | undefined
  placeholder: string;
  state: string[];
  setState: (state: string[]) => void;
  className?: string;
}

export function MultiSelect({ options, placeholder, state, setState, className }: MultiSelectProps) {
  const [open, setOpen] = useState(false);

  const toggleOption = (optionId: string) => {
    setState(
      state.includes(optionId)
        ? state.filter(o => o !== optionId)
        : [...state, optionId]
    );
  };

  const selectedNames = state.length === 0 || !options ? placeholder : state.map(id => options.find(option => option.id === id)!.name).join(", ");

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-full justify-between cursor-default font-normal has-[>svg]:p-6 transition-[background-color]", state.length === 0 && "text-muted-foreground hover:text-muted-foreground", className)}
        >
          <div className='w-full'>
            <input className='w-full pointer-events-none truncate' value={selectedNames} readOnly />
          </div>
          <ChevronDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0 w-(--radix-popover-trigger-width)">
        <Command className='overflow-auto'>
          <CommandGroup className='overflow-auto'>
            <div className='grid min-[540px]:grid-cols-2 grid-cols-1 max-h-80 overflow-y-auto min-w-max w-full'>
              {options && options.map((option) => (
                <CommandItem
                  key={option.id}
                  onSelect={() => toggleOption(option.id)}
                  className="flex items-center whitespace-nowrap gap-2"
                >
                  <div
                    className={cn(
                      "mr-1 flex size-2 p-2 items-center justify-center rounded-sm border border-primary",
                      state.includes(option.id) ? "bg-foreground text-primary-foreground" : "opacity-50"
                    )}
                  >
                    {state.includes(option.id) && (
                      <CheckIcon className="text-white" />
                    )}
                  </div>
                  {option.name}
                </CommandItem>
              ))}
            </div>
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
