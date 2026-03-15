import { Checkbox } from '@/components/ui/checkbox'
import type { AggregatedItem } from '@/lib/shopping-list'

interface ShoppingListItemsProps {
  items: AggregatedItem[]
  checkedItems: Record<string, boolean>
  onToggleCheck: (key: string) => void
}

export default function ShoppingListItems({
  items,
  checkedItems,
  onToggleCheck,
}: ShoppingListItemsProps) {
  return (
    <ul className="space-y-2">
      {items.map((item) => {
        const checked = !!checkedItems[item.key]
        const qty = Number.isInteger(item.quantity) ? item.quantity : item.quantity.toFixed(1)
        const label = item.unit ? `${qty} ${item.unit} ${item.name}` : `${qty} ${item.name}`

        return (
          <li key={item.key} className="flex items-center gap-3">
            <Checkbox
              id={item.key}
              checked={checked}
              onCheckedChange={() => onToggleCheck(item.key)}
            />
            <label
              htmlFor={item.key}
              className={`cursor-pointer text-sm ${checked ? 'line-through opacity-40' : ''}`}
            >
              {label}
            </label>
          </li>
        )
      })}
    </ul>
  )
}
