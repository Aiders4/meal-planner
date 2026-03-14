import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { MEAL_TYPES } from '@/lib/constants'
import type { MealType } from '@/lib/constants'

interface MealTypeSelectorProps {
  value: MealType | null
  onChange: (value: MealType | null) => void
}

export default function MealTypeSelector({ value, onChange }: MealTypeSelectorProps) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Meal Type</label>
      <ToggleGroup
        type="single"
        value={value ?? ''}
        onValueChange={(v) => onChange((v || null) as MealType | null)}
        className="justify-start"
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
