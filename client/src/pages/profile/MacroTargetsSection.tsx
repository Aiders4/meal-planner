import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import type { MacroUnit } from '@/lib/macro-conversion'

interface Props {
  values: { calorie_target: string; protein_target: string; carb_target: string; fat_target: string }
  onChange: (field: string, value: string) => void
  errors: Record<string, string>
  compact?: boolean
  title?: string
  description?: string
  macroUnit?: MacroUnit
  onMacroUnitChange?: (unit: MacroUnit) => void
  percentWarning?: string | null
}

function getFields(unit: MacroUnit) {
  const suffix = unit === 'percent' ? '%' : 'g'
  return [
    { key: 'calorie_target', label: 'Calories (kcal)', placeholder: 'e.g. 600' },
    { key: 'protein_target', label: `Protein (${suffix})`, placeholder: unit === 'percent' ? 'e.g. 30' : 'e.g. 40' },
    { key: 'carb_target', label: `Carbs (${suffix})`, placeholder: unit === 'percent' ? 'e.g. 40' : 'e.g. 75' },
    { key: 'fat_target', label: `Fat (${suffix})`, placeholder: unit === 'percent' ? 'e.g. 30' : 'e.g. 20' },
  ] as const
}

export default function MacroTargetsSection({
  values,
  onChange,
  errors,
  compact = false,
  title = 'Macro Targets',
  description = 'Set your default per-meal targets. All fields are optional.',
  macroUnit = 'grams',
  onMacroUnitChange,
  percentWarning,
}: Props) {
  const fields = getFields(macroUnit)
  const macrosDisabled = macroUnit === 'percent' && values.calorie_target.trim() === ''

  const grid = (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {fields.map((f) => {
        const isMacroField = f.key !== 'calorie_target'
        const disabled = isMacroField && macrosDisabled
        return (
          <div key={f.key} className="flex flex-col gap-2">
            <Label htmlFor={f.key}>{f.label}</Label>
            <Input
              id={f.key}
              type="text"
              inputMode="numeric"
              placeholder={f.placeholder}
              value={values[f.key]}
              onChange={(e) => onChange(f.key, e.target.value)}
              disabled={disabled}
            />
            {errors[f.key] && (
              <p className="text-sm text-destructive">{errors[f.key]}</p>
            )}
          </div>
        )
      })}
    </div>
  )

  if (compact) {
    return grid
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {onMacroUnitChange && (
          <ToggleGroup
            type="single"
            value={macroUnit}
            onValueChange={(v) => {
              if (v === 'grams' || v === 'percent') onMacroUnitChange(v)
            }}
            className="justify-start"
          >
            <ToggleGroupItem value="grams">g</ToggleGroupItem>
            <ToggleGroupItem value="percent">%</ToggleGroupItem>
          </ToggleGroup>
        )}
        {macrosDisabled && (
          <p className="text-sm text-muted-foreground">Set a calorie target first</p>
        )}
        {grid}
        {percentWarning && (
          <p className="text-sm text-amber-600 dark:text-amber-400">{percentWarning}</p>
        )}
      </CardContent>
    </Card>
  )
}
