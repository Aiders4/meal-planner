import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Slider } from '@/components/ui/slider'
import { COOK_TIME_MIN, COOK_TIME_MAX, COOK_TIME_STEP } from '@/lib/constants'

interface Props {
  value: number
  onChange: (value: number) => void
}

export default function CookTimeSection({ value, onChange }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Maximum Cook Time</CardTitle>
        <CardDescription>How long are you willing to spend cooking?</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <Slider
          value={[value]}
          onValueChange={(v) => onChange(v[0])}
          min={COOK_TIME_MIN}
          max={COOK_TIME_MAX}
          step={COOK_TIME_STEP}
        />
        <p className="text-center text-sm font-medium">{value} minutes</p>
      </CardContent>
    </Card>
  )
}
