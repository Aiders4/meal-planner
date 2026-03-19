import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface Partner {
  id: number
  username: string
}

interface PartnerSelectorProps {
  partners: Partner[]
  value: number | null
  onChange: (partnerId: number | null) => void
}

export default function PartnerSelector({ partners, value, onChange }: PartnerSelectorProps) {
  if (partners.length === 0) return null

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Cook Together</label>
      <Select
        value={value !== null ? String(value) : 'solo'}
        onValueChange={(v) => onChange(v === 'solo' ? null : Number(v))}
      >
        <SelectTrigger>
          <SelectValue placeholder="Solo" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="solo">Solo (just me)</SelectItem>
          {partners.map((p) => (
            <SelectItem key={p.id} value={String(p.id)}>
              With {p.username}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
