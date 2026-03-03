import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import MacroBarsSection from './MacroBarsSection'
import IngredientsSection from './IngredientsSection'
import InstructionsSection from './InstructionsSection'
import MealActionButtons from './MealActionButtons'
import type { Meal, MacroTargets } from '@/types/meal'

interface MealCardProps {
  meal: Meal
  targets: MacroTargets
  onAccept: () => void
  onReject: () => void
  updating: boolean
}

export default function MealCard({
  meal,
  targets,
  onAccept,
  onReject,
  updating,
}: MealCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">{meal.title}</CardTitle>
        {meal.description && (
          <CardDescription>{meal.description}</CardDescription>
        )}
        <div className="flex flex-wrap gap-2 pt-1">
          {meal.cuisine && (
            <Badge variant="secondary">{meal.cuisine}</Badge>
          )}
          {meal.cook_time_minutes && (
            <Badge variant="secondary">{meal.cook_time_minutes} min</Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <MacroBarsSection
          calories={meal.calories}
          protein_g={meal.protein_g}
          carbs_g={meal.carbs_g}
          fat_g={meal.fat_g}
          targets={targets}
        />
        <Separator />
        <IngredientsSection ingredients={meal.ingredients} />
        <InstructionsSection instructions={meal.instructions} />
        <Separator />
        <MealActionButtons
          onAccept={onAccept}
          onReject={onReject}
          updating={updating}
        />
      </CardContent>
    </Card>
  )
}
