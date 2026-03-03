import { Link } from 'react-router-dom'
import { AlertCircle } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'

export default function NoProfileAlert() {
  return (
    <Alert>
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Profile Required</AlertTitle>
      <AlertDescription className="mt-2">
        <p className="mb-3">
          Set up your dietary profile before generating meals. This helps the AI
          create meals that match your nutritional goals and dietary needs.
        </p>
        <Button asChild variant="outline" size="sm">
          <Link to="/profile">Set Up Profile</Link>
        </Button>
      </AlertDescription>
    </Alert>
  )
}
