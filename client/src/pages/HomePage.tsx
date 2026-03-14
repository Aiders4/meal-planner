import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { api, ApiError } from '@/lib/api'
import { validateMacroInputs } from '@/lib/validation'
import type { ProfileResponse } from '@/types/profile'
import type { Meal, MacroTargets, GenerateResponse } from '@/types/meal'
import { getDefaultMealType } from '@/lib/constants'
import type { MealType } from '@/lib/constants'
import NoProfileAlert from './home/NoProfileAlert'
import GenerateButton from './home/GenerateButton'
import MealCard from './home/MealCard'
import MealTypeSelector from './home/MealTypeSelector'
import MacroTargetsSection from './profile/MacroTargetsSection'

function parseOptionalInt(value: string): number | null {
  if (value.trim() === '') return null
  return parseInt(value, 10)
}

export default function HomePage() {
  const [hasProfile, setHasProfile] = useState<boolean | null>(null)
  const [macroInputs, setMacroInputs] = useState({
    calorie_target: '',
    protein_target: '',
    carb_target: '',
    fat_target: '',
  })
  const [profileDefaults, setProfileDefaults] = useState<MacroTargets>({
    calorie_target: null,
    protein_target: null,
    carb_target: null,
    fat_target: null,
  })
  const [macroErrors, setMacroErrors] = useState<Record<string, string>>({})
  const [usedTargets, setUsedTargets] = useState<MacroTargets>({
    calorie_target: null,
    protein_target: null,
    carb_target: null,
    fat_target: null,
  })
  const [mealType, setMealType] = useState<MealType | null>(() => getDefaultMealType())
  const [meal, setMeal] = useState<Meal | null>(null)
  const [generating, setGenerating] = useState(false)
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    api<ProfileResponse>('/api/profile')
      .then((data) => {
        if (data.profile !== null) {
          setHasProfile(true)
          const defaults: MacroTargets = {
            calorie_target: data.profile.calorie_target,
            protein_target: data.profile.protein_target,
            carb_target: data.profile.carb_target,
            fat_target: data.profile.fat_target,
          }
          setProfileDefaults(defaults)
          setUsedTargets(defaults)
          setMacroInputs({
            calorie_target: defaults.calorie_target != null ? String(defaults.calorie_target) : '',
            protein_target: defaults.protein_target != null ? String(defaults.protein_target) : '',
            carb_target: defaults.carb_target != null ? String(defaults.carb_target) : '',
            fat_target: defaults.fat_target != null ? String(defaults.fat_target) : '',
          })

          // Resume pending meal if one exists
          api<{ meal: Meal | null }>('/api/meals/pending')
            .then((res) => {
              if (res.meal) {
                setMeal(res.meal)
              }
            })
            .catch(() => {
              // Ignore — non-critical
            })
        } else {
          setHasProfile(false)
        }
      })
      .catch(() => {
        setHasProfile(false)
      })
  }, [])

  function updateMacroField(field: string, value: string) {
    setMacroInputs((prev) => ({ ...prev, [field]: value }))
    setMacroErrors((prev) => {
      const next = { ...prev }
      delete next[field]
      return next
    })
  }

  function resetToDefaults() {
    setMacroInputs({
      calorie_target: profileDefaults.calorie_target != null ? String(profileDefaults.calorie_target) : '',
      protein_target: profileDefaults.protein_target != null ? String(profileDefaults.protein_target) : '',
      carb_target: profileDefaults.carb_target != null ? String(profileDefaults.carb_target) : '',
      fat_target: profileDefaults.fat_target != null ? String(profileDefaults.fat_target) : '',
    })
    setMacroErrors({})
  }

  async function handleGenerate() {
    const errors = validateMacroInputs(macroInputs)
    if (Object.keys(errors).length > 0) {
      setMacroErrors(errors)
      return
    }

    const targets: MacroTargets = {
      calorie_target: parseOptionalInt(macroInputs.calorie_target),
      protein_target: parseOptionalInt(macroInputs.protein_target),
      carb_target: parseOptionalInt(macroInputs.carb_target),
      fat_target: parseOptionalInt(macroInputs.fat_target),
    }
    setUsedTargets(targets)

    setGenerating(true)
    setMeal(null)
    try {
      const data = await api<GenerateResponse>('/api/meals/generate', {
        method: 'POST',
        body: JSON.stringify({
          calorie_target: targets.calorie_target,
          protein_target: targets.protein_target,
          carb_target: targets.carb_target,
          fat_target: targets.fat_target,
          meal_type: mealType,
        }),
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
            targets={usedTargets}
            onAccept={() => handleStatusUpdate('accepted')}
            onReject={() => handleStatusUpdate('rejected')}
            updating={updating}
          />
          <div className="text-center">
            <GenerateButton generating={generating} onGenerate={handleGenerate} />
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center gap-6 py-12 text-center">
          <div>
            <h2 className="text-2xl font-bold">Generate a Meal</h2>
            <p className="text-muted-foreground">
              Adjust targets for this meal, then generate.
            </p>
          </div>
          <div className="w-full max-w-md text-left">
            <MealTypeSelector value={mealType} onChange={setMealType} />
          </div>
          <div className="w-full max-w-md text-left">
            <MacroTargetsSection
              values={macroInputs}
              onChange={updateMacroField}
              errors={macroErrors}
              compact
            />
            <button
              type="button"
              className="mt-2 text-sm text-muted-foreground underline hover:text-foreground"
              onClick={resetToDefaults}
            >
              Reset to defaults
            </button>
          </div>
          <GenerateButton generating={generating} onGenerate={handleGenerate} />
        </div>
      )}
    </div>
  )
}
