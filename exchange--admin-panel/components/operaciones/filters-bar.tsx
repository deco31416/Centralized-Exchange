"use client"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { IconSearch, IconFilter, IconDownload } from "@tabler/icons-react"
import { cn } from "@/lib/utils"

export interface FilterOption {
  label: string
  value: string
}

export interface FilterConfig {
  key: string
  label: string
  options: FilterOption[]
}

interface FiltersBarProps {
  onSearch?: (query: string) => void
  filters?: FilterConfig[]
  onFilterChange?: (key: string, value: string) => void
  onExport?: () => void
  className?: string
}

export function FiltersBar({
  onSearch,
  filters,
  onFilterChange,
  onExport,
  className,
}: FiltersBarProps) {
  return (
    <div className={cn("flex flex-col gap-4 @container", className)}>
      <div className="flex flex-col gap-3 @md:flex-row @md:items-center @md:justify-between">
        {/* Search */}
        {onSearch && (
          <div className="relative flex-1 @md:max-w-sm">
            <IconSearch className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar transacciones..."
              className="pl-9"
              onChange={(e) => onSearch(e.target.value)}
            />
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2">
          {filters && filters.length > 0 && (
            <Button variant="outline" size="sm" className="gap-2">
              <IconFilter className="size-4" />
              Filtros
            </Button>
          )}
          {onExport && (
            <Button variant="outline" size="sm" className="gap-2" onClick={onExport}>
              <IconDownload className="size-4" />
              Exportar
            </Button>
          )}
        </div>
      </div>

      {/* Filter Selects */}
      {filters && filters.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {filters.map((filter) => (
            <Select
              key={filter.key}
              onValueChange={(value) => onFilterChange?.(filter.key, value)}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder={filter.label} />
              </SelectTrigger>
              <SelectContent>
                {filter.options.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ))}
        </div>
      )}
    </div>
  )
}
