import { Check, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface MealActionButtonsProps {
  onAccept: () => void
  onReject: () => void
  updating: boolean
}

export default function MealActionButtons({
  onAccept,
  onReject,
  updating,
}: MealActionButtonsProps) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row">
      <Button
        onClick={onAccept}
        disabled={updating}
        className="flex-1"
      >
        <Check className="mr-2 h-4 w-4" />
        Accept
      </Button>
      <Button
        variant="outline"
        onClick={onReject}
        disabled={updating}
        className="flex-1"
      >
        <X className="mr-2 h-4 w-4" />
        Reject
      </Button>
    </div>
  )
}
