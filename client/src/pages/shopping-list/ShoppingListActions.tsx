import { ClipboardCopy, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ShoppingListActionsProps {
  onCopy: () => void
  onClearAll: () => void
  clearing: boolean
  isEmpty: boolean
}

export default function ShoppingListActions({
  onCopy,
  onClearAll,
  clearing,
  isEmpty,
}: ShoppingListActionsProps) {
  return (
    <div className="flex gap-2">
      <Button variant="outline" size="sm" disabled={isEmpty} onClick={onCopy}>
        <ClipboardCopy className="mr-2 h-4 w-4" />
        Copy to clipboard
      </Button>
      <Button variant="destructive" size="sm" disabled={isEmpty || clearing} onClick={onClearAll}>
        {clearing ? (
          <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
        ) : (
          <Trash2 className="mr-2 h-4 w-4" />
        )}
        Clear all
      </Button>
    </div>
  )
}
