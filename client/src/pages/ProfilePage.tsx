import { useEffect, useState, useMemo } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { api, ApiError } from '@/lib/api'
import { validateMacroInputs } from '@/lib/validation'
import { COOK_TIME_DEFAULT, MACRO_UNIT_STORAGE_KEY } from '@/lib/constants'
import { convertMacroField } from '@/lib/macro-conversion'
import type { MacroUnit } from '@/lib/macro-conversion'
import type { ProfileResponse, ProfileFormState } from '@/types/profile'
import MacroTargetsSection from './profile/MacroTargetsSection'
import DietaryRestrictionsSection from './profile/DietaryRestrictionsSection'
import CuisinePreferencesSection from './profile/CuisinePreferencesSection'
import DislikedIngredientsSection from './profile/DislikedIngredientsSection'
import CookTimeSection from './profile/CookTimeSection'
import CookingPartnersSection from './profile/CookingPartnersSection'

function emptyForm(): ProfileFormState {
  return {
    calorie_target: '',
    protein_target: '',
    carb_target: '',
    fat_target: '',
    restrictions: new Set(),
    cuisine_preferences: [],
    disliked_ingredients: [],
    max_cook_time_minutes: COOK_TIME_DEFAULT,
  }
}

function responseToForm(data: ProfileResponse): ProfileFormState {
  const p = data.profile
  return {
    calorie_target: p?.calorie_target != null ? String(p.calorie_target) : '',
    protein_target: p?.protein_target != null ? String(p.protein_target) : '',
    carb_target: p?.carb_target != null ? String(p.carb_target) : '',
    fat_target: p?.fat_target != null ? String(p.fat_target) : '',
    restrictions: new Set(
      data.dietary_restrictions.map((r) => `${r.category}:${r.value}`)
    ),
    cuisine_preferences: p?.cuisine_preferences
      ? JSON.parse(p.cuisine_preferences) as string[]
      : [],
    disliked_ingredients: data.disliked_ingredients.map((d) => d.ingredient),
    max_cook_time_minutes: p?.max_cook_time_minutes ?? COOK_TIME_DEFAULT,
  }
}

function parseOptionalInt(value: string): number | null {
  if (value.trim() === '') return null
  return parseInt(value, 10)
}

const MACRO_FIELDS = ['protein_target', 'carb_target', 'fat_target'] as const

interface Partner {
  id: number
  username: string
}

export default function ProfilePage() {
  const [form, setForm] = useState<ProfileFormState>(emptyForm)
  const [partners, setPartners] = useState<Partner[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [macroUnit, setMacroUnit] = useState<MacroUnit>(() => {
    const stored = localStorage.getItem(MACRO_UNIT_STORAGE_KEY)
    return stored === 'percent' ? 'percent' : 'grams'
  })

  useEffect(() => {
    Promise.all([
      api<ProfileResponse>('/api/profile'),
      api<{ partners: Partner[] }>('/api/partners'),
    ])
      .then(([data, partnerData]) => {
        const formData = responseToForm(data)
        const stored = localStorage.getItem(MACRO_UNIT_STORAGE_KEY)
        if (stored === 'percent' && formData.calorie_target.trim() !== '') {
          for (const key of MACRO_FIELDS) {
            formData[key] = convertMacroField(formData[key], formData.calorie_target, key, 'grams', 'percent')
          }
        }
        setForm(formData)
        setPartners(partnerData.partners)
      })
      .catch(() => toast.error('Failed to load profile'))
      .finally(() => setLoading(false))
  }, [])

  function updateField(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
    setErrors((prev) => {
      const next = { ...prev }
      delete next[field]
      return next
    })
  }

  function toggleRestriction(key: string) {
    setForm((prev) => {
      const next = new Set(prev.restrictions)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return { ...prev, restrictions: next }
    })
  }

  function toggleCuisine(cuisine: string) {
    setForm((prev) => {
      const list = prev.cuisine_preferences.includes(cuisine)
        ? prev.cuisine_preferences.filter((c) => c !== cuisine)
        : [...prev.cuisine_preferences, cuisine]
      return { ...prev, cuisine_preferences: list }
    })
  }

  function addIngredient(ingredient: string) {
    setForm((prev) => ({
      ...prev,
      disliked_ingredients: [...prev.disliked_ingredients, ingredient],
    }))
  }

  function removeIngredient(ingredient: string) {
    setForm((prev) => ({
      ...prev,
      disliked_ingredients: prev.disliked_ingredients.filter((i) => i !== ingredient),
    }))
  }

  function setCookTime(value: number) {
    setForm((prev) => ({ ...prev, max_cook_time_minutes: value }))
  }

  async function handleAddPartner(username: string) {
    try {
      const data = await api<{ partners: Partner[] }>('/api/partners', {
        method: 'POST',
        body: JSON.stringify({ username }),
      })
      setPartners(data.partners)
      toast.success(`Added ${username} as a cooking partner`)
    } catch (err) {
      if (err instanceof ApiError) {
        toast.error(err.message)
      } else {
        toast.error('Failed to add partner')
      }
    }
  }

  async function handleRemovePartner(partnerId: number) {
    try {
      await api(`/api/partners/${partnerId}`, { method: 'DELETE' })
      setPartners((prev) => prev.filter((p) => p.id !== partnerId))
      toast.success('Partner removed')
    } catch (err) {
      if (err instanceof ApiError) {
        toast.error(err.message)
      } else {
        toast.error('Failed to remove partner')
      }
    }
  }

  function handleMacroUnitChange(unit: MacroUnit) {
    setForm((prev) => {
      const next = { ...prev }
      for (const key of MACRO_FIELDS) {
        next[key] = convertMacroField(prev[key], prev.calorie_target, key, macroUnit, unit)
      }
      return next
    })
    setMacroUnit(unit)
    localStorage.setItem(MACRO_UNIT_STORAGE_KEY, unit)
    setErrors({})
  }

  const percentWarning = useMemo(() => {
    if (macroUnit !== 'percent') return null
    const sum = MACRO_FIELDS.reduce((acc, key) => {
      const n = Number(form[key])
      return acc + (isNaN(n) ? 0 : n)
    }, 0)
    if (sum > 100) return `Total is ${sum}% — exceeds 100%`
    return null
  }, [macroUnit, form.protein_target, form.carb_target, form.fat_target])

  function validate(): boolean {
    const next = validateMacroInputs(form, macroUnit)
    if (macroUnit === 'percent' && Object.keys(next).length === 0) {
      for (const key of MACRO_FIELDS) {
        const grams = convertMacroField(form[key], form.calorie_target, key, 'percent', 'grams')
        const n = Number(grams)
        if (grams !== '' && n > 1000) {
          next[key] = `Converts to ${n}g — exceeds 1,000g limit`
        }
      }
    }
    setErrors(next)
    return Object.keys(next).length === 0
  }

  async function handleSave() {
    if (!validate()) return

    setSubmitting(true)

    const macroValues: Record<string, string> = {}
    for (const key of MACRO_FIELDS) {
      macroValues[key] = macroUnit === 'percent'
        ? convertMacroField(form[key], form.calorie_target, key, 'percent', 'grams')
        : form[key]
    }

    try {
      await Promise.all([
        api('/api/profile', {
          method: 'PUT',
          body: JSON.stringify({
            calorie_target: parseOptionalInt(form.calorie_target),
            protein_target: parseOptionalInt(macroValues.protein_target),
            carb_target: parseOptionalInt(macroValues.carb_target),
            fat_target: parseOptionalInt(macroValues.fat_target),
            cuisine_preferences: form.cuisine_preferences,
            max_cook_time_minutes: form.max_cook_time_minutes,
          }),
        }),
        api('/api/profile/restrictions', {
          method: 'PUT',
          body: JSON.stringify({
            restrictions: Array.from(form.restrictions).map((key) => {
              const [category, value] = key.split(':')
              return { category, value }
            }),
          }),
        }),
        api('/api/profile/disliked-ingredients', {
          method: 'PUT',
          body: JSON.stringify({
            ingredients: form.disliked_ingredients,
          }),
        }),
      ])
      toast.success('Profile saved')
    } catch (err) {
      if (err instanceof ApiError) {
        toast.error(err.message)
      } else {
        toast.error('Something went wrong')
      }
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-muted border-t-foreground" />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 py-6">
      <div>
        <h1 className="text-2xl font-bold">Profile</h1>
        <p className="text-muted-foreground">Configure your dietary preferences and goals.</p>
      </div>

      <Separator />

      <MacroTargetsSection
        values={{
          calorie_target: form.calorie_target,
          protein_target: form.protein_target,
          carb_target: form.carb_target,
          fat_target: form.fat_target,
        }}
        onChange={updateField}
        errors={errors}
        macroUnit={macroUnit}
        onMacroUnitChange={handleMacroUnitChange}
        percentWarning={percentWarning}
      />

      <DietaryRestrictionsSection
        selected={form.restrictions}
        onToggle={toggleRestriction}
      />

      <CuisinePreferencesSection
        selected={form.cuisine_preferences}
        onToggle={toggleCuisine}
      />

      <DislikedIngredientsSection
        ingredients={form.disliked_ingredients}
        onAdd={addIngredient}
        onRemove={removeIngredient}
      />

      <CookTimeSection
        value={form.max_cook_time_minutes}
        onChange={setCookTime}
      />

      <CookingPartnersSection
        partners={partners}
        onAdd={handleAddPartner}
        onRemove={handleRemovePartner}
      />

      <Button
        size="lg"
        className="w-full sm:w-auto sm:self-end"
        disabled={submitting}
        onClick={handleSave}
      >
        {submitting ? 'Saving...' : 'Save Profile'}
      </Button>
    </div>
  )
}
