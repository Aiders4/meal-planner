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
- **SQLite** via `better-sqlite3` with raw SQL (no ORM)
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
- `src/lib/constants.ts` — mirrors server-side allowed values (restrictions, cuisines, cook time bounds)
- `src/types/` — `profile.ts`, `meal.ts` type definitions
- Routes: `/login`, `/register`, `/` (home), `/profile`, `/history`
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
| `DATABASE_PATH` | server | SQLite file path (default `./data/meal-planner.db`) |
| `ANTHROPIC_API_KEY` | server | Claude API key |
| `CORS_ORIGIN` | server | Frontend URL for CORS in production |
| `VITE_API_URL` | client | Backend URL in production |

### API Routes
- `POST /api/auth/register` — `{ email, password }` → `{ token, user }`
- `POST /api/auth/login` — `{ email, password }` → `{ token, user }`
- `GET /api/profile` — returns `{ profile, dietary_restrictions, disliked_ingredients }`
- `PUT /api/profile` — upsert macro targets + cook time + cuisine prefs
- `PUT /api/profile/restrictions` — replace all dietary restrictions
- `PUT /api/profile/disliked-ingredients` — replace all disliked ingredients
- `POST /api/meals/generate` — `{ calorie_target?, protein_target?, carb_target?, fat_target? }` optional per-meal overrides; falls back to profile defaults. Returns `{ meal, warnings }`
- `GET /api/meals?status=accepted&limit=20&offset=0` — paginated meal history with parsed `ingredients`/`instructions` arrays
- `PATCH /api/meals/:id` — `{ status: 'accepted' | 'rejected' }` → `{ meal }`

## Key Patterns
- **Orchestrator pages**: ProfilePage, HomePage, HistoryPage each own all state; child components are pure display
- **Error handling**: `AIServiceError` in `ai.ts` wraps Anthropic errors with user-friendly messages; error middleware logs full stack traces
- **Rate limiting**: `POST /api/meals/generate` — 10 requests per 15 min per IP
- **Profile save**: 3 PUT endpoints called in parallel (`/profile`, `/restrictions`, `/disliked-ingredients`)

## Deployment
- **Frontend**: Vercel with `client/vercel.json` for SPA rewrites
- **Backend**: Render with persistent disk at `/data` for SQLite
- **Server runtime**: `tsx` in production deps — avoids ESM/CJS `__dirname` issues

## Conventions
- Keep commits small and focused — one per meaningful change
- All API routes prefixed with `/api`
- TypeScript strict mode in both client and server
