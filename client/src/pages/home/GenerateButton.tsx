import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { COOKING_MESSAGES } from '@/lib/constants'

interface GenerateButtonProps {
  generating: boolean
  onGenerate: () => void
}

function getRandomIndex(exclude: number): number {
  let next: number
  do {
    next = Math.floor(Math.random() * COOKING_MESSAGES.length)
  } while (next === exclude && COOKING_MESSAGES.length > 1)
  return next
}

export default function GenerateButton({ generating, onGenerate }: GenerateButtonProps) {
  const [messageIndex, setMessageIndex] = useState(() => getRandomIndex(-1))

  useEffect(() => {
    if (!generating) return
    setMessageIndex(getRandomIndex(-1))
    const interval = setInterval(() => {
      setMessageIndex(prev => getRandomIndex(prev))
    }, 5000)
    return () => clearInterval(interval)
  }, [generating])

  return (
    <Button
      onClick={onGenerate}
      disabled={generating}
      className="w-full sm:w-auto"
    >
      {generating ? (
        <>
          <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
          {COOKING_MESSAGES[messageIndex]}
        </>
      ) : (
        'Generate Meal'
      )}
    </Button>
  )
}
