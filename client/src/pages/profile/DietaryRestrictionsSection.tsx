import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { ALLOWED_RESTRICTIONS } from '@/lib/constants'

interface Props {
  selected: Set<string>
  onToggle: (key: string) => void
}

function formatLabel(value: string): string {
  return value
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}

const categories = Object.keys(ALLOWED_RESTRICTIONS) as Array<keyof typeof ALLOWED_RESTRICTIONS>

export default function DietaryRestrictionsSection({ selected, onToggle }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Dietary Restrictions</CardTitle>
        <CardDescription>Select any that apply to you.</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="lifestyle">
          <TabsList className="w-full">
            {categories.map((cat) => (
              <TabsTrigger key={cat} value={cat} className="capitalize">
                {cat}
              </TabsTrigger>
            ))}
          </TabsList>
          {categories.map((cat) => (
            <TabsContent key={cat} value={cat}>
              <div className="grid grid-cols-1 gap-3 pt-4 sm:grid-cols-2">
                {ALLOWED_RESTRICTIONS[cat].map((value) => {
                  const key = `${cat}:${value}`
                  return (
                    <div key={key} className="flex items-center gap-2">
                      <Checkbox
                        id={key}
                        checked={selected.has(key)}
                        onCheckedChange={() => onToggle(key)}
                      />
                      <Label htmlFor={key} className="cursor-pointer font-normal">
                        {formatLabel(value)}
                      </Label>
                    </div>
                  )
                })}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  )
}
