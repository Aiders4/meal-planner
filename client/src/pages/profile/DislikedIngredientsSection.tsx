import { useState } from 'react'
import { X } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface Props {
  ingredients: string[]
  onAdd: (ingredient: string) => void
  onRemove: (ingredient: string) => void
}

export default function DislikedIngredientsSection({ ingredients, onAdd, onRemove }: Props) {
  const [input, setInput] = useState('')
  const [error, setError] = useState('')

  function handleAdd() {
    const trimmed = input.trim()
    if (!trimmed) {
      setError('Enter an ingredient')
      return
    }
    if (trimmed.length > 100) {
      setError('Must be 100 characters or less')
      return
    }
    if (ingredients.some((i) => i.toLowerCase() === trimmed.toLowerCase())) {
      setError('Already added')
      return
    }
    setError('')
    onAdd(trimmed)
    setInput('')
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Disliked Ingredients</CardTitle>
        <CardDescription>Add ingredients you want to avoid.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex gap-2">
          <Input
            placeholder="e.g. cilantro"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                handleAdd()
              }
            }}
          />
          <Button type="button" variant="secondary" onClick={handleAdd}>
            Add
          </Button>
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
        {ingredients.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {ingredients.map((ingredient) => (
              <Badge key={ingredient} variant="secondary" className="gap-1 pr-1">
                {ingredient}
                <button
                  type="button"
                  onClick={() => onRemove(ingredient)}
                  className="ml-1 rounded-full p-0.5 hover:bg-muted"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
