"use client"

import * as React from "react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { IconSearch, IconFilter, IconX } from "@tabler/icons-react"
import { Badge } from "@/components/ui/badge"

interface FilterOption {
  value: string
  label: string
}

interface Filter {
  key: string
  label: string
  options?: FilterOption[]
  type?: "select" | "input" | "date"
  placeholder?: string
}

interface FiltersBarProps {
  filters: Filter[]
  onFiltersChange?: (filters: Record<string, string>) => void
}

export function FiltersBar({ filters, onFiltersChange }: FiltersBarProps) {
  const [activeFilters, setActiveFilters] = React.useState<Record<string, string>>({})
  const [searchQuery, setSearchQuery] = React.useState("")

  const handleFilterChange = (key: string, value: string) => {
    const newFilters = { ...activeFilters, [key]: value }
    setActiveFilters(newFilters)
    onFiltersChange?.(newFilters)
  }

  const clearFilter = (key: string) => {
    const newFilters = { ...activeFilters }
    delete newFilters[key]
    setActiveFilters(newFilters)
    onFiltersChange?.(newFilters)
  }

  const clearAllFilters = () => {
    setActiveFilters({})
    setSearchQuery("")
    onFiltersChange?.({})
  }

  const activeFilterCount = Object.keys(activeFilters).filter(
    (key) => activeFilters[key] && activeFilters[key] !== "all"
  ).length

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        {/* Búsqueda */}
        <div className="relative flex-1 max-w-sm">
          <IconSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Filtros */}
        <div className="flex flex-wrap items-center gap-2">
          {filters.map((filter) => {
            if (filter.type === "input") {
              return (
                <Input
                  key={filter.key}
                  placeholder={filter.placeholder || filter.label}
                  value={activeFilters[filter.key] || ""}
                  onChange={(e) => handleFilterChange(filter.key, e.target.value)}
                  className="w-40"
                />
              )
            }

            return (
              <Select
                key={filter.key}
                value={activeFilters[filter.key] || "all"}
                onValueChange={(value) => handleFilterChange(filter.key, value)}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder={filter.label} />
                </SelectTrigger>
                <SelectContent>
                  {filter.options?.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )
          })}

          {activeFilterCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAllFilters}
              className="h-9"
            >
              <IconX className="mr-1 h-4 w-4" />
              Limpiar
            </Button>
          )}
        </div>
      </div>

      {/* Active Filters Display */}
      {activeFilterCount > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <IconFilter className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">
            Filtros activos:
          </span>
          {Object.entries(activeFilters).map(([key, value]) => {
            if (!value || value === "all") return null
            
            const filter = filters.find((f) => f.key === key)
            const option = filter?.options?.find((o) => o.value === value)
            
            return (
              <Badge key={key} variant="secondary" className="gap-1">
                {filter?.label}: {option?.label || value}
                <button
                  onClick={() => clearFilter(key)}
                  className="ml-1 hover:text-destructive"
                >
                  <IconX className="h-3 w-3" />
                </button>
              </Badge>
            )
          })}
        </div>
      )}
    </div>
  )
}
