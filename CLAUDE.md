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

## Client
- Vite config proxies `/api` requests to `http://localhost:3001`
- shadcn/ui components go in `src/components/ui/`
- Add new shadcn components with: `npx shadcn@latest add <component>` (run from `client/`)

## Server
- Entry point: `server/src/index.ts`
- Environment variables loaded from `server/.env` (not committed — use `.env.example` as template)
- Health check: `GET /api/health` returns `{ status: "ok" }`

## Progress
- Phases 1–5 complete (scaffolding, database, auth, profile API, AI meal generation)
- `zod` already installed in server (used for profile and meals validation)
- `@anthropic-ai/sdk` installed in server (AI service uses claude-haiku-4-5 with forced tool_use)

## Future / Production Hardening
- Rate limiting on `POST /api/meals/generate` — each call costs money (Anthropic API); add before any public deployment
- CORS lockdown, HTTPS, other production security measures

## Conventions
- Keep commits small and focused — one per meaningful change
- All API routes are prefixed with `/api`
- TypeScript strict mode enabled in both client and server
