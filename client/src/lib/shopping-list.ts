import type { Ingredient } from '@/types/meal'

export interface AggregatedItem {
  name: string
  quantity: number
  unit: string
  key: string
}

export function aggregateIngredients(ingredientLists: Ingredient[][]): AggregatedItem[] {
  const map = new Map<string, { name: string; quantity: number; unit: string }>()

  for (const list of ingredientLists) {
    for (const item of list) {
      const unit = item.unit ?? ''
      const key = `${item.name.toLowerCase()}|${unit.toLowerCase()}`
      const existing = map.get(key)
      if (existing) {
        existing.quantity += item.quantity ?? 0
      } else {
        map.set(key, { name: item.name, quantity: item.quantity ?? 0, unit })
      }
    }
  }

  return Array.from(map.entries())
    .map(([key, { name, quantity, unit }]) => ({ name, quantity, unit, key }))
    .sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()))
}

export function formatShoppingList(items: AggregatedItem[]): string {
  return items
    .map((item) => {
      const qty = Number.isInteger(item.quantity) ? item.quantity : item.quantity.toFixed(1)
      return item.unit ? `${qty} ${item.unit} ${item.name}` : `${qty} ${item.name}`
    })
    .join('\n')
}
