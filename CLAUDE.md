# Meal Planner — Claude Code Guide

## Project Overview
AI meal planner web app. Users set dietary constraints and macro targets, AI generates meals that fit. All 10 build phases are complete.

## Structure
Monorepo with npm workspaces:
- `client/` — React + TypeScript + Vite (port 5173)
- `server/` — Express + TypeScript with tsx (port 3001)

## Commands
- `npm run dev` — starts both client and server concurrently (run from root)
- `npm install -w client <pkg>` / `npm install -w server <pkg>` — install workspace deps
- `npx shadcn@latest add <component>` — add shadcn/ui component (run from `client/`)

## Tech Stack (do not deviate)
- **Tailwind CSS v4** — `@tailwindcss/vite` plugin, CSS-based config (no tailwind.config)
- **shadcn/ui** — `@/*` path alias → `./src/*`, components in `src/components/ui/`
- **SQLite** via `@libsql/client` with raw SQL (no ORM) — Turso in production, local file in development
- **tsx watch** for server dev (not ts-node or nodemon)
- **npm** as package manager (not pnpm or yarn)
- **zod** for server-side validation
- **Anthropic SDK** — AI service uses claude-haiku-4-5 with forced tool_use

## Design
- `design/decisions.md` — persistent style guide; consult before UI work, update when decisions change

## Client
- Vite proxies `/api` → `http://localhost:3001`
- `src/lib/api.ts` — fetch wrapper with auth header, 401 redirect, `ApiError`
- `src/context/AuthContext.tsx` — `AuthProvider`, `useAuth()`, login/register/logout
- `src/components/layout/AppLayout.tsx` — app shell with header, nav, `<Outlet />`
- `src/lib/constants.ts` — mirrors server-side allowed values (restrictions, cuisines, cook time bounds, meal types, localStorage keys)
- `src/lib/macro-conversion.ts` — `MacroUnit` type, grams↔percent conversion utilities
- `src/types/` — `profile.ts`, `meal.ts` type definitions
- `src/lib/shopping-list.ts` — `aggregateIngredients()` and `formatShoppingList()` pure utilities
- Routes: `/login`, `/register`, `/` (home), `/profile`, `/history`, `/shopping-list`
- MealCard `onAccept`/`onReject`/`updating` props are optional — omit to hide action buttons
- `erasableSyntaxOnly` enabled — use explicit property declaration + constructor assignment, not `public` parameter properties

## Server
- Entry: `server/src/index.ts`
- Env vars from `server/.env` (see `.env.example`)
- Health: `GET /api/health` → `{ status: "ok" }`

### Environment Variables

| Variable | Where | Purpose |
|----------|-------|---------|
| `PORT` | server | Server port (default 3001) |
| `JWT_SECRET` | server | JWT signing key |
| `DATABASE_PATH` | server | SQLite file path for local dev (default `./data/meal-planner.db`) |
| `ANTHROPIC_API_KEY` | server | Claude API key |
| `TURSO_DATABASE_URL` | server | Turso database URL (production only) |
| `TURSO_AUTH_TOKEN` | server | Turso auth token (production only) |
| `INVITE_CODE` | server | Registration invite code (unset = open registration) |
| `CORS_ORIGIN` | server | Frontend URL for CORS in production |
| `VITE_API_URL` | client | Backend URL in production |

### API Routes
- `POST /api/auth/register` — `{ email, password, invite_code }` → `{ token, user }` (403 if code wrong/missing when `INVITE_CODE` is set)
- `POST /api/auth/login` — `{ email, password }` → `{ token, user }`
- `GET /api/profile` — returns `{ profile, dietary_restrictions, disliked_ingredients }`
- `PUT /api/profile` — upsert macro targets + cook time + cuisine prefs
- `PUT /api/profile/restrictions` — replace all dietary restrictions
- `PUT /api/profile/disliked-ingredients` — replace all disliked ingredients
- `POST /api/meals/generate` — `{ calorie_target?, protein_target?, carb_target?, fat_target?, meal_type? }` optional per-meal overrides; falls back to profile defaults. Auto-deletes any pending meals first. Sends both accepted and rejected meal titles to AI for avoidance. Returns `{ meal, warnings }`
- `GET /api/meals/pending` — returns `{ meal }` (most recent pending meal) or `{ meal: null }`
- `GET /api/meals?status=accepted&meal_type=dinner&limit=20&offset=0` — paginated meal history with parsed `ingredients`/`instructions` arrays
- `PATCH /api/meals/:id` — `{ status?, on_shopping_list? }` (at least one required) → `{ meal }`
- `GET /api/meals/shopping-list` — returns `{ meals }` (accepted meals on shopping list, parsed JSON columns)
- `DELETE /api/meals/shopping-list` — clears all meals from shopping list → `{ cleared }`

## Key Patterns
- **Orchestrator pages**: ProfilePage, HomePage, HistoryPage, ShoppingListPage each own all state; child components are pure display
- **Error handling**: `AIServiceError` in `ai.ts` wraps Anthropic errors with user-friendly messages; error middleware logs full stack traces
- **Rate limiting**: `POST /api/meals/generate` — 10 requests per 15 min per IP + 10 per user per day (UTC)
- **Security headers**: `helmet` middleware on all routes
- **Profile save**: 3 PUT endpoints called in parallel (`/profile`, `/restrictions`, `/disliked-ingredients`)
- **Async DB layer**: All query functions in `db/queries/` are `async` and return Promises — always `await` them in route handlers
- **DB transactions**: Use `client.batch([...statements], 'write')` for atomic multi-statement operations
- **Meal status lifecycle**: Pending meals auto-delete on new generation; rejected meal titles fed to AI for avoidance; HomePage resumes last pending meal on mount via `GET /api/meals/pending`
- **JSON column parsing**: Use `parseJsonColumn()` in `routes/meals.ts` instead of raw `JSON.parse` — handles double-stringified legacy data and discards corrupt pending meals gracefully
- **Meal type**: Optional `meal_type` (breakfast/lunch/dinner/snack) on meals; auto-detected by time of day on HomePage; passed to AI for context-appropriate generation; filterable in history
- **Macro unit toggle**: Profile page supports grams/percent input for protein/carbs/fat; conversion is client-side only, DB always stores grams. `MacroTargetsSection` accepts optional `macroUnit`/`onMacroUnitChange` props — omit them (as HomePage does) for grams-only mode
- **Shopping list**: `on_shopping_list` column on meals (INTEGER 0/1); accepted meals can be toggled onto the list from History; ShoppingListPage aggregates ingredients by name+unit, checkbox state stored in localStorage
- **DB migrations**: New columns added via try/catch `ALTER TABLE` in `initializeDatabase()` — catches "duplicate column" for idempotency

## Deployment
- **Frontend**: Vercel with `client/vercel.json` for SPA rewrites
- **Backend**: Render (free tier) with Turso for SQLite database
- **Server runtime**: `tsx` in production deps — avoids ESM/CJS `__dirname` issues

### Redeployment
- **Frontend**: Pushes to `main` auto-deploy on Vercel
- **Backend**: Pushes to `main` auto-deploy on Render

### Pre-Deployment Checklist (first-time only)
1. Create a Turso database and set `TURSO_DATABASE_URL` + `TURSO_AUTH_TOKEN` on Render
2. Set `INVITE_CODE` env var on Render to a secret value — blocks random signups
3. Set `CORS_ORIGIN` env var on Render to the Vercel frontend URL
4. Set `JWT_SECRET` to a random 64+ character string
5. Verify `ANTHROPIC_API_KEY` is set and Anthropic spending cap is in place

## Conventions
- Keep commits small and focused — one per meaningful change
- All API routes prefixed with `/api`
- TypeScript strict mode in both client and server
