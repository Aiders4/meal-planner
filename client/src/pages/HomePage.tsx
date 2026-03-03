import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { api, ApiError } from '@/lib/api'
import type { ProfileResponse } from '@/types/profile'
import type { Meal, MacroTargets, GenerateResponse } from '@/types/meal'
import NoProfileAlert from './home/NoProfileAlert'
import GenerateButton from './home/GenerateButton'
import MealCard from './home/MealCard'

export default function HomePage() {
  const [hasProfile, setHasProfile] = useState<boolean | null>(null)
  const [targets, setTargets] = useState<MacroTargets>({
    calorie_target: null,
    protein_target: null,
    carb_target: null,
    fat_target: null,
  })
  const [meal, setMeal] = useState<Meal | null>(null)
  const [generating, setGenerating] = useState(false)
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    api<ProfileResponse>('/api/profile')
      .then((data) => {
        if (data.profile && data.profile.calorie_target !== null) {
          setHasProfile(true)
          setTargets({
            calorie_target: data.profile.calorie_target,
            protein_target: data.profile.protein_target,
            carb_target: data.profile.carb_target,
            fat_target: data.profile.fat_target,
          })
        } else {
          setHasProfile(false)
        }
      })
      .catch(() => {
        setHasProfile(false)
      })
  }, [])

  async function handleGenerate() {
    setGenerating(true)
    setMeal(null)
    try {
      const data = await api<GenerateResponse>('/api/meals/generate', {
        method: 'POST',
        body: '{}',
      })
      setMeal(data.meal)
      if (data.warnings.length > 0) {
        data.warnings.forEach((w) => toast.warning(w))
      }
    } catch (err) {
      if (err instanceof ApiError) {
        toast.error(err.message)
      } else {
        toast.error('Failed to generate meal. Please try again.')
      }
    } finally {
      setGenerating(false)
    }
  }

  async function handleStatusUpdate(status: 'accepted' | 'rejected') {
    if (!meal) return
    setUpdating(true)
    try {
      await api<{ meal: Meal }>(`/api/meals/${meal.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      })
      toast.success(status === 'accepted' ? 'Meal accepted!' : 'Meal rejected')
      setMeal(null)
    } catch (err) {
      if (err instanceof ApiError) {
        toast.error(err.message)
      } else {
        toast.error('Failed to update meal. Please try again.')
      }
    } finally {
      setUpdating(false)
    }
  }

  if (hasProfile === null) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-muted border-t-foreground" />
      </div>
    )
  }

  if (!hasProfile) {
    return (
      <div className="mx-auto max-w-lg py-12">
        <NoProfileAlert />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6 py-8">
      {meal ? (
        <>
          <MealCard
            meal={meal}
            targets={targets}
            onAccept={() => handleStatusUpdate('accepted')}
            onReject={() => handleStatusUpdate('rejected')}
            updating={updating}
          />
          <div className="text-center">
            <GenerateButton generating={generating} onGenerate={handleGenerate} />
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center gap-4 py-12 text-center">
          <h2 className="text-2xl font-bold">Ready to Generate Meals</h2>
          <p className="text-muted-foreground">
            Generate a meal based on your dietary preferences and macro targets.
          </p>
          <GenerateButton generating={generating} onGenerate={handleGenerate} />
        </div>
      )}
    </div>
  )
}
