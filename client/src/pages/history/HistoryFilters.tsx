import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'

export type FilterValue = 'all' | 'accepted' | 'rejected'

interface HistoryFiltersProps {
  activeFilter: FilterValue
  onFilterChange: (value: FilterValue) => void
}

export default function HistoryFilters({
  activeFilter,
  onFilterChange,
}: HistoryFiltersProps) {
  return (
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
  )
}
