import { useEffect, useState, useMemo } from 'react'
import { toast } from 'sonner'
import { Separator } from '@/components/ui/separator'
import { api, ApiError } from '@/lib/api'
import { SHOPPING_CHECKS_STORAGE_KEY } from '@/lib/constants'
import { aggregateIngredients, formatShoppingList } from '@/lib/shopping-list'
import type { Meal } from '@/types/meal'
import ShoppingListItems from './shopping-list/ShoppingListItems'
import ShoppingListActions from './shopping-list/ShoppingListActions'

export default function ShoppingListPage() {
  const [meals, setMeals] = useState<Meal[]>([])
  const [loading, setLoading] = useState(true)
  const [clearing, setClearing] = useState(false)
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>(() => {
    try {
      const stored = localStorage.getItem(SHOPPING_CHECKS_STORAGE_KEY)
      return stored ? JSON.parse(stored) : {}
    } catch {
      return {}
    }
  })

  useEffect(() => {
    api<{ meals: Meal[] }>('/api/meals/shopping-list')
      .then((data) => setMeals(data.meals))
      .catch((err) => {
        if (err instanceof ApiError) {
          toast.error(err.message)
        } else {
          toast.error('Failed to load shopping list')
        }
      })
      .finally(() => setLoading(false))
  }, [])

  const aggregatedItems = useMemo(
    () => aggregateIngredients(meals.map((m) => m.ingredients)),
    [meals]
  )

  function handleToggleCheck(key: string) {
    setCheckedItems((prev) => {
      const next = { ...prev, [key]: !prev[key] }
      localStorage.setItem(SHOPPING_CHECKS_STORAGE_KEY, JSON.stringify(next))
      return next
    })
  }

  async function handleCopy() {
    const text = formatShoppingList(aggregatedItems)
    await navigator.clipboard.writeText(text)
    toast.success('Copied to clipboard')
  }

  async function handleClearAll() {
    setClearing(true)
    try {
      await api('/api/meals/shopping-list', { method: 'DELETE' })
      setMeals([])
      setCheckedItems({})
      localStorage.removeItem(SHOPPING_CHECKS_STORAGE_KEY)
      toast.success('Shopping list cleared')
    } catch (err) {
      if (err instanceof ApiError) {
        toast.error(err.message)
      } else {
        toast.error('Failed to clear shopping list')
      }
    } finally {
      setClearing(false)
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6 py-8">
      <div>
        <h1 className="text-2xl font-bold">Shopping List</h1>
        <p className="text-sm text-muted-foreground">
          Ingredients from your added meals, aggregated and ready to shop.
        </p>
      </div>
      <Separator />

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-muted border-t-foreground" />
        </div>
      ) : aggregatedItems.length === 0 ? (
        <p className="py-12 text-center text-sm text-muted-foreground">
          Your shopping list is empty. Add meals from your History page.
        </p>
      ) : (
        <>
          <ShoppingListActions
            onCopy={handleCopy}
            onClearAll={handleClearAll}
            clearing={clearing}
            isEmpty={aggregatedItems.length === 0}
          />
          <ShoppingListItems
            items={aggregatedItems}
            checkedItems={checkedItems}
            onToggleCheck={handleToggleCheck}
          />
        </>
      )}
    </div>
  )
}
