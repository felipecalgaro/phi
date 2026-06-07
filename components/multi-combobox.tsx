"use client"

import type { ComboboxRootProps } from "@base-ui/react"
import type { ReactElement } from "react"

import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxItem,
  ComboboxList,
  ComboboxValue,
  useComboboxAnchor,
} from "@/components/ui/combobox"
import { cn } from "@/lib/utils"

export interface MultiComboboxOption {
  label: string
  value: string
}

type MultiComboboxRootProps = ComboboxRootProps<MultiComboboxOption, true>

const TypedCombobox = Combobox as unknown as (
  props: MultiComboboxRootProps,
) => ReactElement

interface MultiComboboxProps {
  items: MultiComboboxOption[]
  selectedValues: string[]
  onSelectedValuesChange: (values: string[]) => void
  placeholder?: string
  className?: string
}

export function MultiCombobox({
  items,
  selectedValues,
  onSelectedValuesChange,
  placeholder,
  className,
}: MultiComboboxProps) {
  const anchor = useComboboxAnchor()
  const selectedItems = items.filter((item) => selectedValues.includes(item.value))

  return (
    <TypedCombobox
      multiple
      autoHighlight
      items={items}
      value={selectedItems}
      onValueChange={(next: MultiComboboxOption[]) => {
        onSelectedValuesChange(next.map((item) => item.value))
      }}
    >
      <ComboboxChips ref={anchor} className={cn("w-full", className)}>
        <ComboboxValue>
          {(values: MultiComboboxOption[]) => (
            <>
              {values.map((item) => (
                <ComboboxChip key={item.value}>{item.label}</ComboboxChip>
              ))}
              <ComboboxChipsInput placeholder={selectedItems.length > 0 ? undefined : placeholder} />
            </>
          )}
        </ComboboxValue>
      </ComboboxChips>
      <ComboboxContent anchor={anchor}>
        <ComboboxEmpty>No items found.</ComboboxEmpty>
        <ComboboxList>
          {(item: MultiComboboxOption) => (
            <ComboboxItem key={item.value} value={item}>
              {item.label}
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </TypedCombobox>
  )
}
