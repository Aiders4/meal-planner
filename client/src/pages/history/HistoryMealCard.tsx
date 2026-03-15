import { useState } from 'react'
import { ChevronDown, ShoppingCart, Check, ArrowRightLeft } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import MacroBarsSection from '../home/MacroBarsSection'
import IngredientsSection from '../home/IngredientsSection'
import InstructionsSection from '../home/InstructionsSection'
import type { Meal, MacroTargets } from '@/types/meal'

interface HistoryMealCardProps {
  meal: Meal
  targets: MacroTargets
  onToggleShoppingList?: (mealId: number) => void
  togglingShoppingList?: boolean
  onStatusChange?: (mealId: number, newStatus: 'accepted' | 'rejected') => void
  changingStatus?: boolean
}

function StatusBadge({ status }: { status: Meal['status'] }) {
  const variant =
    status === 'accepted'
      ? 'default'
      : status === 'rejected'
        ? 'secondary'
        : 'outline'

  return <Badge variant={variant}>{status}</Badge>
}

function macroSummary(meal: Meal): string {
  const parts: string[] = []
  if (meal.calories !== null) parts.push(`${meal.calories} kcal`)
  if (meal.protein_g !== null) parts.push(`${meal.protein_g}g protein`)
  if (meal.carbs_g !== null) parts.push(`${meal.carbs_g}g carbs`)
  if (meal.fat_g !== null) parts.push(`${meal.fat_g}g fat`)
  return parts.join(' · ')
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export default function HistoryMealCard({
  meal,
  targets,
  onToggleShoppingList,
  togglingShoppingList,
  onStatusChange,
  changingStatus,
}: HistoryMealCardProps) {
  const [expanded, setExpanded] = useState(false)
  const summary = macroSummary(meal)

  return (
    <Card>
      <button
        type="button"
        className="w-full cursor-pointer px-6 py-4 text-left"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1 space-y-1">
            <div className="flex items-center gap-2">
              <h3 className="truncate text-base font-semibold">
                {meal.title}
              </h3>
              <StatusBadge status={meal.status} />
            </div>
            {summary && (
              <p className="text-sm text-muted-foreground">{summary}</p>
            )}
            <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
              {meal.meal_type && <span className="capitalize">{meal.meal_type}</span>}
              {meal.cuisine && <span>{meal.cuisine}</span>}
              {meal.cook_time_minutes && (
                <span>{meal.cook_time_minutes} min</span>
              )}
              <span>{formatDate(meal.created_at)}</span>
            </div>
          </div>
          <ChevronDown
            className={`mt-1 h-4 w-4 shrink-0 text-muted-foreground transition-transform ${expanded ? 'rotate-180' : ''}`}
          />
        </div>
      </button>
      {expanded && (
        <CardContent className="space-y-4 pt-0">
          <Separator />
          <MacroBarsSection
            calories={meal.calories}
            protein_g={meal.protein_g}
            carbs_g={meal.carbs_g}
            fat_g={meal.fat_g}
            targets={targets}
          />
          {meal.description && (
            <p className="text-sm text-muted-foreground">{meal.description}</p>
          )}
          <Separator />
          <IngredientsSection ingredients={meal.ingredients} />
          <InstructionsSection instructions={meal.instructions} />
          {(meal.status === 'accepted' || meal.status === 'rejected') && (
            <>
              <Separator />
              <div className="flex flex-wrap gap-2">
                {meal.status === 'accepted' && onToggleShoppingList && (
                  <Button
                    variant={meal.on_shopping_list ? 'outline' : 'default'}
                    size="sm"
                    disabled={togglingShoppingList}
                    onClick={() => onToggleShoppingList(meal.id)}
                  >
                    {meal.on_shopping_list ? (
                      <>
                        <Check className="mr-2 h-4 w-4" />
                        On list
                      </>
                    ) : (
                      <>
                        <ShoppingCart className="mr-2 h-4 w-4" />
                        Add to list
                      </>
                    )}
                  </Button>
                )}
                {onStatusChange && (
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={changingStatus}
                    onClick={() =>
                      onStatusChange(
                        meal.id,
                        meal.status === 'accepted' ? 'rejected' : 'accepted'
                      )
                    }
                  >
                    <ArrowRightLeft className="mr-2 h-4 w-4" />
                    {meal.status === 'accepted' ? 'Reject' : 'Accept'}
                  </Button>
                )}
              </div>
            </>
          )}
        </CardContent>
      )}
    </Card>
  )
}
