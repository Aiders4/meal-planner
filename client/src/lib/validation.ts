interface MacroInputs {
  calorie_target: string
  protein_target: string
  carb_target: string
  fat_target: string
}

export function validateMacroInputs(values: MacroInputs): Record<string, string> {
  const errors: Record<string, string> = {}

  const cal = values.calorie_target.trim()
  if (cal !== '') {
    const n = Number(cal)
    if (!Number.isInteger(n) || n < 1 || n > 10000) {
      errors.calorie_target = 'Must be between 1 and 10,000'
    }
  }

  for (const key of ['protein_target', 'carb_target', 'fat_target'] as const) {
    const v = values[key].trim()
    if (v !== '') {
      const n = Number(v)
      if (!Number.isInteger(n) || n < 0 || n > 1000) {
        errors[key] = 'Must be between 0 and 1,000'
      }
    }
  }

  return errors
}
