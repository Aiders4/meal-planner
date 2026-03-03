import { Progress } from '@/components/ui/progress'
import type { MacroTargets } from '@/types/meal'

interface MacroBarsSectionProps {
  calories: number | null
  protein_g: number | null
  carbs_g: number | null
  fat_g: number | null
  targets: MacroTargets
}

interface MacroBarProps {
  label: string
  actual: number | null
  target: number | null
  unit: string
}

function MacroBar({ label, actual, target, unit }: MacroBarProps) {
  if (actual === null) return null

  if (target === null) {
    return (
      <div className="space-y-1">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium">{label}</span>
          <span>
            {actual} {unit}
          </span>
        </div>
        <p className="text-xs text-muted-foreground">No target set</p>
      </div>
    )
  }

  const percentage = Math.min(100, Math.max(0, Math.round((actual / target) * 100)))

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium">{label}</span>
        <span>
          {actual} / {target} {unit}
        </span>
      </div>
      <Progress value={percentage} />
    </div>
  )
}

export default function MacroBarsSection({
  calories,
  protein_g,
  carbs_g,
  fat_g,
  targets,
}: MacroBarsSectionProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <MacroBar
        label="Calories"
        actual={calories}
        target={targets.calorie_target}
        unit="kcal"
      />
      <MacroBar
        label="Protein"
        actual={protein_g}
        target={targets.protein_target}
        unit="g"
      />
      <MacroBar
        label="Carbs"
        actual={carbs_g}
        target={targets.carb_target}
        unit="g"
      />
      <MacroBar
        label="Fat"
        actual={fat_g}
        target={targets.fat_target}
        unit="g"
      />
    </div>
  )
}
