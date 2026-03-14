export type MacroUnit = 'grams' | 'percent'

type MacroField = 'protein_target' | 'carb_target' | 'fat_target'

const CAL_PER_GRAM: Record<MacroField, number> = {
  protein_target: 4,
  carb_target: 4,
  fat_target: 9,
}

export function gramsToPercent(grams: number, calorieTarget: number, macro: MacroField): number {
  return Math.round((grams * CAL_PER_GRAM[macro]) / calorieTarget * 100)
}

export function percentToGrams(pct: number, calorieTarget: number, macro: MacroField): number {
  return Math.round((pct * calorieTarget) / CAL_PER_GRAM[macro] / 100)
}

export function convertMacroField(
  value: string,
  calorieTarget: string,
  macro: MacroField,
  from: MacroUnit,
  to: MacroUnit,
): string {
  if (from === to) return value
  const trimmed = value.trim()
  if (trimmed === '') return ''
  const cal = Number(calorieTarget)
  if (!cal || cal <= 0) return ''
  const n = Number(trimmed)
  if (isNaN(n)) return ''
  if (from === 'grams') {
    return String(gramsToPercent(n, cal, macro))
  }
  return String(percentToGrams(n, cal, macro))
}
