import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface Props {
  values: { calorie_target: string; protein_target: string; carb_target: string; fat_target: string }
  onChange: (field: string, value: string) => void
  errors: Record<string, string>
}

const fields = [
  { key: 'calorie_target', label: 'Calories (kcal)', placeholder: 'e.g. 2000' },
  { key: 'protein_target', label: 'Protein (g)', placeholder: 'e.g. 150' },
  { key: 'carb_target', label: 'Carbs (g)', placeholder: 'e.g. 250' },
  { key: 'fat_target', label: 'Fat (g)', placeholder: 'e.g. 65' },
] as const

export default function MacroTargetsSection({ values, onChange, errors }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Macro Targets</CardTitle>
        <CardDescription>Set your daily nutritional goals. All fields are optional.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {fields.map((f) => (
            <div key={f.key} className="flex flex-col gap-2">
              <Label htmlFor={f.key}>{f.label}</Label>
              <Input
                id={f.key}
                type="text"
                inputMode="numeric"
                placeholder={f.placeholder}
                value={values[f.key]}
                onChange={(e) => onChange(f.key, e.target.value)}
              />
              {errors[f.key] && (
                <p className="text-sm text-destructive">{errors[f.key]}</p>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
