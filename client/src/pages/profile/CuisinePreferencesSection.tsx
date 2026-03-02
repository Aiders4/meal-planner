import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ALLOWED_CUISINES } from '@/lib/constants'

interface Props {
  selected: string[]
  onToggle: (cuisine: string) => void
}

export default function CuisinePreferencesSection({ selected, onToggle }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Cuisine Preferences</CardTitle>
        <CardDescription>Select cuisines you enjoy. Leave empty for no preference.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          {ALLOWED_CUISINES.map((cuisine) => {
            const isSelected = selected.includes(cuisine)
            return (
              <button key={cuisine} type="button" onClick={() => onToggle(cuisine)}>
                <Badge variant={isSelected ? 'default' : 'outline'}>
                  {cuisine}
                </Badge>
              </button>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
