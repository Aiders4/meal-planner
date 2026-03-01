import { useState } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import { Menu, X, Sun, Moon, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/useAuth'
import { useDarkMode } from '@/hooks/useDarkMode'
import { cn } from '@/lib/utils'

const navLinks = [
  { to: '/', label: 'Home', end: true },
  { to: '/profile', label: 'Profile' },
  { to: '/history', label: 'History' },
]

function NavItems({ onClick }: { onClick?: () => void }) {
  return (
    <>
      {navLinks.map((link) => (
        <NavLink
          key={link.to}
          to={link.to}
          end={link.end}
          onClick={onClick}
          className={({ isActive }) =>
            cn(
              'text-sm font-medium transition-colors hover:text-foreground',
              isActive ? 'text-foreground' : 'text-muted-foreground',
            )
          }
        >
          {link.label}
        </NavLink>
      ))}
    </>
  )
}

export default function AppLayout() {
  const { logout } = useAuth()
  const { dark, toggle } = useDarkMode()
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b bg-background">
        <div className="mx-auto flex h-14 max-w-4xl items-center justify-between px-4">
          <NavLink to="/" className="text-lg font-semibold">
            Meal Planner
          </NavLink>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-6 md:flex">
            <NavItems />
          </nav>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={toggle} aria-label="Toggle dark mode">
              {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={logout}
              className="hidden md:inline-flex"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>

            {/* Mobile hamburger */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <nav className="border-t px-4 py-3 md:hidden">
            <div className="flex flex-col gap-3">
              <NavItems onClick={() => setMobileOpen(false)} />
              <Button
                variant="ghost"
                size="sm"
                onClick={logout}
                className="w-fit"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            </div>
          </nav>
        )}
      </header>

      <main className="mx-auto max-w-4xl px-4 py-6">
        <Outlet />
      </main>
    </div>
  )
}
