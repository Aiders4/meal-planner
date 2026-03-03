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
- `src/types/meal.ts` — `Ingredient`, `Meal`, `GenerateResponse`, `MacroTargets` interfaces
- `src/pages/` — LoginPage, RegisterPage, HomePage, ProfilePage
- `src/pages/profile/` — MacroTargetsSection, DietaryRestrictionsSection, CuisinePreferencesSection, DislikedIngredientsSection, CookTimeSection
- `src/pages/home/` — NoProfileAlert, GenerateButton, MacroBarsSection, IngredientsSection, InstructionsSection, MealActionButtons, MealCard
- Routes: `/login`, `/register`, `/` (home), `/profile`, `/history` (placeholder)
- `erasableSyntaxOnly` is enabled in client tsconfig — use explicit property declaration + constructor assignment, not `public` parameter properties

## Server
- Entry point: `server/src/index.ts`
- Environment variables loaded from `server/.env` (not committed — use `.env.example` as template)
- Health check: `GET /api/health` returns `{ status: "ok" }`

### Server API Routes (already implemented)
- `POST /api/auth/register` — `{ email, password }` → `{ token, user }`
- `POST /api/auth/login` — `{ email, password }` → `{ token, user }`
- `GET /api/profile` — returns `{ profile, dietary_restrictions, disliked_ingredients }`
- `PUT /api/profile` — upsert macro targets + cook time + cuisine prefs
- `PUT /api/profile/restrictions` — replace all dietary restrictions
- `PUT /api/profile/disliked-ingredients` — replace all disliked ingredients
- `POST /api/meals/generate` — calls Claude API, returns `{ meal, warnings }`
- `GET /api/meals?status=accepted&limit=20&offset=0` — paginated meal history, returns `{ meals: Meal[], total: number }`. Each meal has parsed `ingredients` (array) and `instructions` (array). Filter by `status` (optional), paginate with `limit`/`offset`.
- `PATCH /api/meals/:id` — `{ status: 'accepted' | 'rejected' }` → `{ meal }`

## Progress
- Phases 1–8 complete (scaffolding, database, auth, profile API, AI meal generation, frontend layout & auth, profile page, meal generation UI)
- `zod` already installed in server (used for profile and meals validation)
- `@anthropic-ai/sdk` installed in server (AI service uses claude-haiku-4-5 with forced tool_use)
- Client dependencies added in Phase 6: `react-router-dom`, `sonner` (toast notifications)
- shadcn/ui components installed: button, input, label, card, sonner, checkbox, slider, badge, separator, tabs, progress, accordion, skeleton, alert
- Next up: Phase 9 (Meal History) — see spec below

## Phase 9 Spec: Meal History
Build a `/history` page (replace current placeholder) showing past generated meals:
1. **Filter tabs**: All / Accepted / Rejected (use existing `tabs` component or simple button group)
2. **Compact meal cards**: title, macros summary, date, status badge — click to expand full details
3. **Pagination**: 20 meals per page, "Load more" button or page navigation
4. **Empty state**: message if no meals exist yet
- Server endpoint ready: `GET /api/meals?status=...&limit=20&offset=0` → `{ meals, total }`
- Reuse: `Meal` type from `src/types/meal.ts`, `api()` from `src/lib/api.ts`, existing meal card sub-components from `src/pages/home/`
- shadcn components to install: `pagination`, `dropdown-menu` (for sort/filter if needed)
- Follow orchestrator pattern: HistoryPage manages state, child components are pure display

## Future / Production Hardening
- Rate limiting on `POST /api/meals/generate` — each call costs money (Anthropic API); add before any public deployment
- CORS lockdown, HTTPS, other production security measures

## Conventions
- Keep commits small and focused — one per meaningful change
- All API routes are prefixed with `/api`
- TypeScript strict mode enabled in both client and server
