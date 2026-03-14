import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { MEAL_TYPES } from '@/lib/constants'
import type { MealType } from '@/lib/constants'

export type FilterValue = 'all' | 'accepted' | 'rejected'

interface HistoryFiltersProps {
  activeFilter: FilterValue
  onFilterChange: (value: FilterValue) => void
  mealTypeFilter: MealType | null
  onMealTypeChange: (value: MealType | null) => void
}

export default function HistoryFilters({
  activeFilter,
  onFilterChange,
  mealTypeFilter,
  onMealTypeChange,
}: HistoryFiltersProps) {
  return (
    <div className="space-y-3">
      <Tabs
        value={activeFilter}
        onValueChange={(v) => onFilterChange(v as FilterValue)}
      >
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="accepted">Accepted</TabsTrigger>
          <TabsTrigger value="rejected">Rejected</TabsTrigger>
        </TabsList>
      </Tabs>
      <ToggleGroup
        type="single"
        value={mealTypeFilter ?? ''}
        onValueChange={(v) => onMealTypeChange((v || null) as MealType | null)}
      >
        {MEAL_TYPES.map((type) => (
          <ToggleGroupItem key={type} value={type} className="capitalize">
            {type}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
    </div>
  )
}
