import { useState } from 'react'
import { Button } from '@/components/ui/button'
import type { Ingredient } from '@/types/meal'

interface IngredientsSectionProps {
  ingredients: Ingredient[]
}

export default function IngredientsSection({ ingredients }: IngredientsSectionProps) {
  const [showAll, setShowAll] = useState(false)
  const visibleCount = 6
  const hasMore = ingredients.length > visibleCount
  const displayed = showAll ? ingredients : ingredients.slice(0, visibleCount)

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium">Ingredients</h3>
      <ul className="space-y-1 text-sm">
        {displayed.map((ing, i) => (
          <li key={i}>
            {ing.quantity} {ing.unit} {ing.name}
          </li>
        ))}
      </ul>
      {hasMore && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowAll(!showAll)}
          className="h-auto p-0 text-xs text-muted-foreground"
        >
          {showAll
            ? 'Show less'
            : `Show all ${ingredients.length} ingredients`}
        </Button>
      )}
    </div>
  )
}
