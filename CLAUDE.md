# Meal Planner — Claude Code Guide

## Project Overview
AI meal planner web app. Users set dietary constraints and macro targets, AI generates meals that fit. See `MealPlannerProjectPlan.md` for full spec, DB schema, API routes, and build phases.

## Structure
Monorepo with npm workspaces:
- `client/` — React + TypeScript + Vite (port 5173)
- `server/` — Express + TypeScript with tsx (port 3001)

## Commands
- `npm run dev` — starts both client and server concurrently (run from root)
- `npm install -w client <pkg>` — install a dependency in client
- `npm install -w server <pkg>` — install a dependency in server
- `npm install` — install all workspace dependencies (run from root)

## Tech Decisions (do not deviate)
- **Tailwind CSS v4** with `@tailwindcss/vite` plugin (no tailwind.config file — v4 uses CSS-based config)
- **shadcn/ui** initialized with `@/*` path alias mapping to `./src/*`
- **vite-tsconfig-paths** for import alias resolution in Vite
- **SQLite** via `better-sqlite3` with **raw SQL** (no ORM) — this is intentional for learning
- **tsx watch** for server dev (not ts-node or nodemon)
- **npm** as package manager (not pnpm or yarn)

## Design
- **Style guide**: `design/decisions.md` is the persistent style guide for all UI work (Phases 6–9). Consult it before building any frontend component. When a design decision is made or changed (layout, spacing, color, component choice, screen-specific convention), update `decisions.md` to reflect it.
- **Wireframes**: `design/wireframes.md` has ASCII wireframes for reference
- **Prototype**: `design/prototype.html` is a standalone visual mockup (open in browser)

## Client
- Vite config proxies `/api` requests to `http://localhost:3001`
- shadcn/ui components go in `src/components/ui/`
- Add new shadcn components with: `npx shadcn@latest add <component>` (run from `client/`)
- `src/lib/api.ts` — fetch wrapper with auth header, 401 redirect, `ApiError`
- `src/context/AuthContext.tsx` — `AuthProvider`, `useAuth()`, login/register/logout
- `src/hooks/useDarkMode.ts` — dark mode toggle with localStorage
- `src/components/layout/AppLayout.tsx` — app shell with header, nav, `<Outlet />`
- `src/lib/constants.ts` — `ALLOWED_RESTRICTIONS`, `ALLOWED_CUISINES`, cook time bounds (mirrors server)
- `src/types/profile.ts` — `ProfileResponse`, `ProfileFormState` interfaces
- `src/pages/` — LoginPage, RegisterPage, HomePage, ProfilePage
- `src/pages/profile/` — MacroTargetsSection, DietaryRestrictionsSection, CuisinePreferencesSection, DislikedIngredientsSection, CookTimeSection
- Routes: `/login`, `/register`, `/` (home), `/profile`, `/history` (placeholder)
- `erasableSyntaxOnly` is enabled in client tsconfig — use explicit property declaration + constructor assignment, not `public` parameter properties

## Server
- Entry point: `server/src/index.ts`
- Environment variables loaded from `server/.env` (not committed — use `.env.example` as template)
- Health check: `GET /api/health` returns `{ status: "ok" }`

## Progress
- Phases 1–7 complete (scaffolding, database, auth, profile API, AI meal generation, frontend layout & auth, profile page)
- `zod` already installed in server (used for profile and meals validation)
- `@anthropic-ai/sdk` installed in server (AI service uses claude-haiku-4-5 with forced tool_use)
- Client dependencies added in Phase 6: `react-router-dom`, `sonner` (toast notifications)
- shadcn/ui components installed: button, input, label, card, sonner, checkbox, slider, badge, separator, tabs
- Next up: Phase 8 (Meal Generation UI) — needs shadcn `progress`, `accordion`, `skeleton`, `alert`

## Future / Production Hardening
- Rate limiting on `POST /api/meals/generate` — each call costs money (Anthropic API); add before any public deployment
- CORS lockdown, HTTPS, other production security measures

## Conventions
- Keep commits small and focused — one per meaningful change
- All API routes are prefixed with `/api`
- TypeScript strict mode enabled in both client and server
