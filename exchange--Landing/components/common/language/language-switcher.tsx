"use client"

import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { languages } from "./languages"

export function LanguageSwitcher({ className }: { className?: string }) {
  const [open, setOpen] = React.useState(false)
  const [value, setValue] = React.useState("es") // Idioma predeterminado

  const selectedLanguage = languages.find((language) => language.value === value)
  const widthClass = className ?? "w-[170px]"

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("justify-between", widthClass)}
        >
          {selectedLanguage?.label}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className={cn("p-0 min-w-[--radix-popover-trigger-width]", className)}>
        <Command>
          <CommandList>
            <CommandGroup>
              {languages.map((language) => {
                const Flag = language.Flag

                return (
                  <CommandItem
                    key={language.value}
                    value={language.value}
                    onSelect={() => {
                      setValue(language.value)
                      setOpen(false)
                    }}
                    className="flex items-center"
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === language.value ? "opacity-100" : "opacity-0"
                      )}
                    />
                    <span className="mr-2 grid h-5 w-8 shrink-0 place-items-center overflow-hidden rounded-sm border border-border bg-background">
                      <Flag title={language.label} className="h-full w-full object-contain" />
                    </span>
                    <span className="min-w-0 flex-1 truncate">{language.label}</span>
                    <span className="ml-2 text-xs font-bold uppercase tracking-wide text-muted-foreground">
                      {language.region}
                    </span>
                  </CommandItem>
                )
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
