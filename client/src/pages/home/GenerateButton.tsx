import { Button } from '@/components/ui/button'

interface GenerateButtonProps {
  generating: boolean
  onGenerate: () => void
}

export default function GenerateButton({ generating, onGenerate }: GenerateButtonProps) {
  return (
    <Button
      onClick={onGenerate}
      disabled={generating}
      className="w-full sm:w-auto"
    >
      {generating ? (
        <>
          <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
          Creating your meal...
        </>
      ) : (
        'Generate Meal'
      )}
    </Button>
  )
}
