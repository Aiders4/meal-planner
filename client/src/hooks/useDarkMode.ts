import { useState, useCallback } from 'react'

const STORAGE_KEY = 'carte-dark-mode'

function getInitialDark(): boolean {
  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored !== null) return stored === 'true'
  return window.matchMedia('(prefers-color-scheme: dark)').matches
}

export function useDarkMode() {
  const [dark, setDark] = useState(getInitialDark)

  const toggle = useCallback(() => {
    setDark((prev) => {
      const next = !prev
      localStorage.setItem(STORAGE_KEY, String(next))
      if (next) {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
      return next
    })
  }, [])

  return { dark, toggle }
}
