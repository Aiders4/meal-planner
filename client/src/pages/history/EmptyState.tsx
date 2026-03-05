import type { FilterValue } from './HistoryFilters'

interface EmptyStateProps {
  filter: FilterValue
}

const messages: Record<FilterValue, { title: string; description: string }> = {
  all: {
    title: 'No meals yet',
    description: 'Generate your first meal from the home page to get started.',
  },
  accepted: {
    title: 'No accepted meals',
    description: 'Meals you accept will appear here.',
  },
  rejected: {
    title: 'No rejected meals',
    description: 'Meals you reject will appear here.',
  },
}

export default function EmptyState({ filter }: EmptyStateProps) {
  const { title, description } = messages[filter]

  return (
    <div className="flex flex-col items-center gap-2 py-16 text-center">
      <h2 className="text-lg font-semibold">{title}</h2>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  )
}
