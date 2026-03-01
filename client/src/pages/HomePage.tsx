import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { UtensilsCrossed } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { api } from '@/lib/api'

export default function HomePage() {
  const [hasProfile, setHasProfile] = useState<boolean | null>(null)

  useEffect(() => {
    api<{ profile: { calorie_target: number | null } }>('/api/profile')
      .then((data) => {
        setHasProfile(data.profile.calorie_target !== null)
      })
      .catch(() => {
        setHasProfile(false)
      })
  }, [])

  if (hasProfile === null) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-muted border-t-foreground" />
      </div>
    )
  }

  return (
    <div className="flex justify-center py-12">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
            <UtensilsCrossed className="h-6 w-6 text-muted-foreground" />
          </div>
          <CardTitle className="text-xl">
            {hasProfile ? 'Ready to Generate Meals' : 'Welcome to Meal Planner'}
          </CardTitle>
          <CardDescription>
            {hasProfile
              ? 'Your profile is set up. Generate a meal based on your preferences.'
              : 'Set up your dietary profile to get personalized meal suggestions.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {hasProfile ? (
            <Button disabled className="w-full">
              Generate Meal
            </Button>
          ) : (
            <Button asChild className="w-full">
              <Link to="/profile">Set Up Profile</Link>
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
