import { useEffect, useState, useCallback } from 'react'
import { toast } from 'sonner'
import { Separator } from '@/components/ui/separator'
import { api, ApiError } from '@/lib/api'
import type { ProfileResponse } from '@/types/profile'
import type { Meal, MacroTargets } from '@/types/meal'
import type { MealType } from '@/lib/constants'
import HistoryFilters from './history/HistoryFilters'
import type { FilterValue } from './history/HistoryFilters'
import HistoryMealCard from './history/HistoryMealCard'
import EmptyState from './history/EmptyState'
import LoadMoreButton from './history/LoadMoreButton'

const PAGE_SIZE = 20

export default function HistoryPage() {
  const [filter, setFilter] = useState<FilterValue>('all')
  const [mealTypeFilter, setMealTypeFilter] = useState<MealType | null>(null)
  const [meals, setMeals] = useState<Meal[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [targets, setTargets] = useState<MacroTargets>({
    calorie_target: null,
    protein_target: null,
    carb_target: null,
    fat_target: null,
  })

  useEffect(() => {
    api<ProfileResponse>('/api/profile')
      .then((data) => {
        if (data.profile && data.profile.calorie_target !== null) {
          setTargets({
            calorie_target: data.profile.calorie_target,
            protein_target: data.profile.protein_target,
            carb_target: data.profile.carb_target,
            fat_target: data.profile.fat_target,
          })
        }
      })
      .catch(() => {
        // Profile not set — targets stay null, bars show "No target set"
      })
  }, [])

  const fetchMeals = useCallback(
    async (offset: number, append: boolean) => {
      const statusParam = filter === 'all' ? '' : `&status=${filter}`
      const mealTypeParam = mealTypeFilter ? `&meal_type=${mealTypeFilter}` : ''
      try {
        const data = await api<{ meals: Meal[]; total: number }>(
          `/api/meals?limit=${PAGE_SIZE}&offset=${offset}${statusParam}${mealTypeParam}`
        )
        setMeals((prev) => (append ? [...prev, ...data.meals] : data.meals))
        setTotal(data.total)
      } catch (err) {
        if (err instanceof ApiError) {
          toast.error(err.message)
        } else {
          toast.error('Failed to load meals.')
        }
      }
    },
    [filter, mealTypeFilter]
  )

  useEffect(() => {
    setLoading(true)
    setMeals([])
    fetchMeals(0, false).finally(() => setLoading(false))
  }, [fetchMeals])

  async function handleLoadMore() {
    setLoadingMore(true)
    await fetchMeals(meals.length, true)
    setLoadingMore(false)
  }

  const [togglingShoppingList, setTogglingShoppingList] = useState<number | null>(null)

  async function handleToggleShoppingList(mealId: number) {
    const meal = meals.find((m) => m.id === mealId)
    const current = meal?.on_shopping_list ?? false
    setTogglingShoppingList(mealId)
    try {
      await api(`/api/meals/${mealId}`, {
        method: 'PATCH',
        body: JSON.stringify({ on_shopping_list: !current }),
      })
      setMeals((prev) =>
        prev.map((m) =>
          m.id === mealId ? { ...m, on_shopping_list: !current } : m
        )
      )
      toast.success(current ? 'Removed from shopping list' : 'Added to shopping list')
    } catch (err) {
      if (err instanceof ApiError) {
        toast.error(err.message)
      } else {
        toast.error('Failed to update shopping list')
      }
    } finally {
      setTogglingShoppingList(null)
    }
  }

  const hasMore = meals.length < total

  return (
    <div className="mx-auto max-w-2xl space-y-6 py-8">
      <div>
        <h1 className="text-2xl font-bold">Meal History</h1>
        <p className="text-sm text-muted-foreground">
          Browse your past generated meals.
        </p>
      </div>
      <Separator />

      <HistoryFilters
        activeFilter={filter}
        onFilterChange={setFilter}
        mealTypeFilter={mealTypeFilter}
        onMealTypeChange={setMealTypeFilter}
      />

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-muted border-t-foreground" />
        </div>
      ) : meals.length === 0 ? (
        <EmptyState filter={filter} />
      ) : (
        <div className="space-y-3">
          {meals.map((meal) => (
            <HistoryMealCard
              key={meal.id}
              meal={meal}
              targets={targets}
              onToggleShoppingList={handleToggleShoppingList}
              togglingShoppingList={togglingShoppingList === meal.id}
            />
          ))}
          {hasMore && (
            <LoadMoreButton
              onLoadMore={handleLoadMore}
              loading={loadingMore}
            />
          )}
        </div>
      )}
    </div>
  )
}
