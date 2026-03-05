import { Button } from '@/components/ui/button'

interface LoadMoreButtonProps {
  onLoadMore: () => void
  loading: boolean
}

export default function LoadMoreButton({
  onLoadMore,
  loading,
}: LoadMoreButtonProps) {
  return (
    <div className="flex justify-center pt-4">
      <Button variant="outline" onClick={onLoadMore} disabled={loading}>
        {loading ? (
          <>
            <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-muted border-t-foreground" />
            Loading...
          </>
        ) : (
          'Load more'
        )}
      </Button>
    </div>
  )
}
