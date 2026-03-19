import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

interface Partner {
  id: number
  username: string
}

interface CookingPartnersSectionProps {
  partners: Partner[]
  onAdd: (username: string) => Promise<void>
  onRemove: (partnerId: number) => Promise<void>
}

export default function CookingPartnersSection({ partners, onAdd, onRemove }: CookingPartnersSectionProps) {
  const [username, setUsername] = useState('')
  const [adding, setAdding] = useState(false)
  const [removingId, setRemovingId] = useState<number | null>(null)

  async function handleAdd() {
    const trimmed = username.trim().toLowerCase()
    if (!trimmed) return

    setAdding(true)
    try {
      await onAdd(trimmed)
      setUsername('')
    } finally {
      setAdding(false)
    }
  }

  async function handleRemove(partnerId: number) {
    setRemovingId(partnerId)
    try {
      await onRemove(partnerId)
    } finally {
      setRemovingId(null)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Cooking Partners</CardTitle>
        <CardDescription>Add partners to cook together. Shared meals merge both profiles.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input
            placeholder="Enter username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                handleAdd()
              }
            }}
          />
          <Button onClick={handleAdd} disabled={adding || !username.trim()}>
            {adding ? 'Adding...' : 'Add'}
          </Button>
        </div>
        {partners.length > 0 ? (
          <ul className="space-y-2">
            {partners.map((partner) => (
              <li key={partner.id} className="flex items-center justify-between rounded-md border px-3 py-2">
                <span className="font-medium">{partner.username}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemove(partner.id)}
                  disabled={removingId === partner.id}
                >
                  Remove
                </Button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground">No cooking partners yet.</p>
        )}
      </CardContent>
    </Card>
  )
}
