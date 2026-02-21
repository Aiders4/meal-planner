# AI Meal Planner — Project Plan

## Overview
Plan based on [[MealPlannerProjectBrief]]

A web app where users define dietary constraints and macro targets, then AI generates meal ideas that fit all of them. Built as a learning project to develop backend, database, auth, and AI integration skills.

**One-line summary**: Define your constraints once → get meals that actually work for you.

---

## Decisions Log

Decisions made upfront so Claude Code can build without deliberating.

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Frontend | React + TypeScript + Vite | Builds on existing React skills. Vite is fast and simple. TypeScript required by shadcn/ui. |
| UI library | shadcn/ui + Tailwind CSS | Polished look without custom design work. Copy-paste components, not a dependency. |
| Backend | Node.js + Express + TypeScript | Natural next step from React. TypeScript shared with frontend reduces context-switching. |
| Database | SQLite via `better-sqlite3` | Zero setup (no server to run). File-based. Perfect for learning SQL. Can migrate to Postgres later. |
| SQL approach | Raw SQL queries (no ORM) | The learning goal is SQL fundamentals. An ORM would hide what you're trying to learn. |
| AI provider | Claude API (Haiku) via `@anthropic-ai/sdk` | Cost-efficient. Structured output via tool_use gives reliable JSON. |
| Auth | Email/password with bcrypt + JWT | Auth is a stated learning goal. Rolling it yourself teaches the concepts. |
| Hosting | Render (backend + SQLite) + Vercel (frontend) | Both have free tiers. Render supports persistent disk for SQLite. |
| Monorepo | Single repo, `/client` and `/server` folders | Simpler than managing two repos. One `git clone` to get started. |
| Package manager | npm | Already familiar from React project. No need to learn pnpm/yarn yet. |

---

## Tech Stack Summary

```
┌─────────────────────────────────────────┐
│  Frontend (Vercel)                      │
│  React + TypeScript + Vite              │
│  shadcn/ui + Tailwind CSS              │
│  Fetch API for HTTP requests            │
└──────────────┬──────────────────────────┘
               │ JSON API calls
┌──────────────▼──────────────────────────┐
│  Backend (Render)                       │
│  Node.js + Express + TypeScript         │
│  bcrypt + jsonwebtoken                  │
│  @anthropic-ai/sdk                      │
└──────────────┬──────────────────────────┘
               │ SQL queries
┌──────────────▼──────────────────────────┐
│  Database                               │
│  SQLite (file-based, on server disk)    │
└─────────────────────────────────────────┘
```

---

## Folder Structure

```
meal-planner/
├── client/                    # React frontend
│   ├── src/
│   │   ├── components/        # Reusable UI components
│   │   │   └── ui/            # shadcn/ui components go here
│   │   ├── pages/             # Page-level components
│   │   ├── hooks/             # Custom React hooks
│   │   ├── lib/               # Utilities (API client, helpers)
│   │   ├── types/             # Shared TypeScript types
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── index.html
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
├── server/                    # Express backend
│   ├── src/
│   │   ├── routes/            # Express route handlers
│   │   ├── middleware/        # Auth middleware, error handling
│   │   ├── db/                # Database setup + queries
│   │   │   ├── schema.sql     # Table definitions
│   │   │   ├── connection.ts  # SQLite connection
│   │   │   └── queries/       # Query functions grouped by table
│   │   ├── services/          # Business logic (AI generation, etc.)
│   │   ├── types/             # TypeScript types
│   │   └── index.ts           # Entry point
│   ├── package.json
│   └── tsconfig.json
├── .env.example               # Template for environment variables
├── .gitignore
└── README.md
```

---

## Database Schema

### `users`

| Column | Type | Notes |
|--------|------|-------|
| id | INTEGER PRIMARY KEY | Auto-increment |
| email | TEXT UNIQUE NOT NULL | Login identifier |
| password_hash | TEXT NOT NULL | bcrypt hash, never store plaintext |
| created_at | TEXT NOT NULL | ISO 8601 timestamp |

### `profiles`

One-to-one with users. Separated so user account and preferences are distinct concerns.

| Column | Type | Notes |
|--------|------|-------|
| id | INTEGER PRIMARY KEY | |
| user_id | INTEGER UNIQUE NOT NULL | FK → users.id |
| calorie_target | INTEGER | e.g. 2200 |
| protein_target_g | INTEGER | e.g. 150 |
| carb_target_g | INTEGER | e.g. 250 |
| fat_target_g | INTEGER | e.g. 70 |
| cuisine_preferences | TEXT | JSON array, e.g. `["Italian", "Japanese", "Mexican"]` |
| max_cook_time_minutes | INTEGER | e.g. 30 |
| updated_at | TEXT NOT NULL | |

### `dietary_restrictions`

Many-to-one with users. Each row is one restriction. This is more flexible than a JSON blob — easy to query, easy to extend.

| Column | Type | Notes |
|--------|------|-------|
| id | INTEGER PRIMARY KEY | |
| user_id | INTEGER NOT NULL | FK → users.id |
| category | TEXT NOT NULL | One of: `lifestyle`, `allergy`, `religious`, `medical` |
| value | TEXT NOT NULL | e.g. `vegetarian`, `gluten-free`, `halal`, `low-sodium` |

**Supported restriction values by category:**

- **lifestyle**: `vegetarian`, `vegan`, `pescatarian`, `flexitarian`
- **allergy**: `gluten`, `dairy`, `nuts`, `peanuts`, `tree-nuts`, `eggs`, `shellfish`, `fish`, `soy`, `sesame`, `celery`, `mustard`, `lupin`, `molluscs` (covers UK allergen labelling requirements)
- **religious**: `halal`, `kosher`
- **medical**: `low-sodium`, `low-sugar`, `diabetic-friendly`, `low-fodmap`

### `meals`

Stores every AI-generated meal. The full recipe data lives as JSON — it's read-only display data, not something you need to query inside of.

| Column | Type | Notes |
|--------|------|-------|
| id | INTEGER PRIMARY KEY | |
| user_id | INTEGER NOT NULL | FK → users.id |
| title | TEXT NOT NULL | e.g. "Spicy Black Bean Tacos" |
| description | TEXT | Short 1-2 sentence summary |
| ingredients | TEXT NOT NULL | JSON array of `{ name, quantity, unit }` |
| instructions | TEXT NOT NULL | JSON array of step strings |
| calories | INTEGER NOT NULL | Total for the meal |
| protein_g | REAL NOT NULL | |
| carbs_g | REAL NOT NULL | |
| fat_g | REAL NOT NULL | |
| cook_time_minutes | INTEGER | |
| cuisine | TEXT | e.g. "Mexican" |
| status | TEXT NOT NULL DEFAULT 'pending' | `pending`, `accepted`, `rejected` |
| created_at | TEXT NOT NULL | |

### `disliked_ingredients`

Separate table so AI can be told to avoid specific ingredients.

| Column | Type | Notes |
|--------|------|-------|
| id | INTEGER PRIMARY KEY | |
| user_id | INTEGER NOT NULL | FK → users.id |
| ingredient | TEXT NOT NULL | e.g. "aubergine", "coriander" |

**Indexes to create:**
- `meals.user_id` (you'll query meals by user constantly)
- `dietary_restrictions.user_id`
- `disliked_ingredients.user_id`

---

## API Routes

All routes return JSON. Auth routes are public; everything else requires a valid JWT in the `Authorization: Bearer <token>` header.

### Auth

| Method | Path | Body | Response | Notes |
|--------|------|------|----------|-------|
| POST | `/api/auth/register` | `{ email, password }` | `{ token, user }` | Hash password with bcrypt (12 rounds). Return JWT. |
| POST | `/api/auth/login` | `{ email, password }` | `{ token, user }` | Compare with bcrypt. Return JWT. |

### Profile

| Method | Path | Body | Response | Notes |
|--------|------|------|----------|-------|
| GET | `/api/profile` | — | `{ profile, dietary_restrictions, disliked_ingredients }` | Returns full profile for logged-in user |
| PUT | `/api/profile` | `{ calorie_target, protein_target_g, ... }` | `{ profile }` | Create or update (upsert) |
| PUT | `/api/profile/restrictions` | `{ restrictions: [{ category, value }] }` | `{ dietary_restrictions }` | Replace all restrictions (delete + re-insert) |
| PUT | `/api/profile/disliked-ingredients` | `{ ingredients: ["coriander", ...] }` | `{ disliked_ingredients }` | Replace all (delete + re-insert) |

### Meals

| Method | Path | Body | Response | Notes |
|--------|------|------|----------|-------|
| POST | `/api/meals/generate` | `{ preferences_override? }` | `{ meal }` | Calls Claude API. Uses profile data as constraints. Optional overrides for one-off tweaks. |
| GET | `/api/meals` | Query: `?status=accepted&limit=20&offset=0` | `{ meals, total }` | Paginated meal history. Filter by status. |
| PATCH | `/api/meals/:id` | `{ status: 'accepted' \| 'rejected' }` | `{ meal }` | Accept or reject a generated meal. |

---

## AI Integration Design

### The Prompt Strategy

Use Claude's **tool_use** feature to get structured JSON output reliably. This is more robust than asking for JSON in a text prompt — the model is forced to output valid structured data.

**System prompt** (set once per request):

```
You are a meal planning assistant. Generate a single meal that meets
the user's nutritional targets and dietary restrictions. The meal should
be practical, use commonly available ingredients, and include precise
quantities for accurate macro calculations.

Be creative and varied — avoid suggesting the same meals repeatedly.
Ensure macro numbers are realistic and internally consistent (i.e. the
macros from individual ingredients should roughly sum to the totals).
```

**Tool definition** (forces structured output):

```json
{
  "name": "create_meal",
  "description": "Generate a meal with full nutritional information",
  "input_schema": {
    "type": "object",
    "required": ["title", "description", "ingredients", "instructions", "calories", "protein_g", "carbs_g", "fat_g", "cook_time_minutes", "cuisine"],
    "properties": {
      "title": { "type": "string" },
      "description": { "type": "string", "description": "1-2 sentence summary" },
      "ingredients": {
        "type": "array",
        "items": {
          "type": "object",
          "required": ["name", "quantity", "unit"],
          "properties": {
            "name": { "type": "string" },
            "quantity": { "type": "number" },
            "unit": { "type": "string", "description": "g, ml, tbsp, tsp, whole, etc." }
          }
        }
      },
      "instructions": {
        "type": "array",
        "items": { "type": "string" },
        "description": "Step-by-step cooking instructions"
      },
      "calories": { "type": "integer" },
      "protein_g": { "type": "number" },
      "carbs_g": { "type": "number" },
      "fat_g": { "type": "number" },
      "cook_time_minutes": { "type": "integer" },
      "cuisine": { "type": "string" }
    }
  }
}
```

**User message** (constructed dynamically per request):

```
Generate a meal with these requirements:

Nutritional targets:
- Calories: ~{calorie_target} kcal
- Protein: ~{protein_target_g}g
- Carbs: ~{carb_target_g}g
- Fat: ~{fat_target_g}g

Dietary restrictions: {restrictions as comma-separated list}

Ingredients to avoid: {disliked ingredients as comma-separated list}

Preferred cuisines: {cuisines as comma-separated list, or "any"}

Maximum cook time: {max_cook_time_minutes} minutes

{If there are recently accepted meals:}
Avoid repeating these recent meals: {last 5 accepted meal titles}
```

### Validation Rules

AI-generated data needs sanity checking before saving. Apply these checks server-side:

1. **Macro consistency**: Check that `(protein_g × 4) + (carbs_g × 4) + (fat_g × 9)` is within ±15% of stated calories. If it fails, flag but still save — the meal may still be useful.
2. **Calorie range**: Reject if calories are less than 100 or greater than 3000 (likely a hallucination).
3. **Non-empty**: Reject if ingredients array is empty or instructions array is empty.
4. **Cook time**: Reject if cook_time_minutes exceeds the user's maximum by more than 10 minutes.

If validation fails, retry the API call once. If it fails again, return an error to the user with a "try again" option.

---

## Auth Implementation

### How JWT Auth Works (conceptual)

```
1. User registers or logs in
2. Server verifies credentials
3. Server creates a JWT containing { userId, email } signed with a secret key
4. Server sends JWT to client
5. Client stores JWT in memory (not localStorage — see security note)
6. Client sends JWT in Authorization header on every request
7. Server middleware decodes JWT, finds user, attaches to request
8. If JWT is expired or invalid → 401 Unauthorized
```

### Security Decisions

| Concern | Decision | Why |
|---------|----------|-----|
| Password storage | bcrypt with 12 salt rounds | Industry standard. Slow-to-hash by design, which protects against brute force. |
| Token storage (client) | In-memory React state + `httpOnly` cookie as fallback | Avoids XSS attacks that could steal tokens from `localStorage`. |
| Token expiry | 7 days | Long enough for convenience, short enough for safety. |
| JWT secret | Environment variable, never committed to code | Code is on GitHub — secrets must live in `.env` only. |
| Input validation | Validate email format, minimum password length (8 chars) | Prevent junk data and weak passwords. |
| Rate limiting | `express-rate-limit` on auth routes (5 attempts per 15 min) | Prevents brute force login attacks. |

### Files Involved

- `server/src/middleware/auth.ts` — JWT verification middleware
- `server/src/routes/auth.ts` — register/login route handlers
- `client/src/hooks/useAuth.ts` — React hook for auth state + API calls
- `client/src/lib/api.ts` — Fetch wrapper that attaches JWT to requests

---

## Environment Variables

Create a `.env` file in `/server` (never committed — add to `.gitignore`):

```env
# Server
PORT=3001

# Auth
JWT_SECRET=generate-a-random-64-char-string-here

# Database
DATABASE_PATH=./data/meal-planner.db

# Claude API
ANTHROPIC_API_KEY=sk-ant-your-key-here
```

Create a `.env.example` with the same keys but placeholder values. This gets committed to git so other developers know what's needed.

---

## Build Phases

Each phase introduces **one major new concept**. Complete each phase fully before moving on. Every phase ends with something testable.

---

### Phase 0: Environment and Accounts Setup

**You learn**: Setting up your development environment and third-party accounts before writing any code.

**What to do:**
1. Create a new GitHub repository called `meal-planner` (public, with a README) - done
2. Clone it to your local machine - done
3. Save this file as `PROJECT_PLAN.md` in the repo root — Claude Code can reference it directly during each phase - done
4. Sign up for an Anthropic API account at [console.anthropic.com](https://console.anthropic.com) - done
5. Generate an API key and save it somewhere secure (you'll need it in Phase 5) - done
6. Set a spending limit on your Anthropic account — £5/month is plenty for development - done
7. Verify Node.js is installed: run `node --version` (need 20+) - done
8. Verify npm is installed: run `npm --version` - done
9. Verify Claude Code is installed and working: run `claude` in your terminal - done

**How to test it**: You have a cloned repo on your machine, an Anthropic API key saved securely, and running `claude` opens Claude Code in your terminal.

**Key detail**: Don't skip the spending limit. API costs for this project will be pennies, but a spending cap is a safety net against accidental loops during development.

---

### Phase 1: Project Scaffolding

**You learn**: Monorepo setup, TypeScript config, project tooling.

**What to build:**
1. Create the root `meal-planner/` directory with the folder structure above
2. Initialise `client/` with Vite + React + TypeScript (`npm create vite@latest`)
3. Initialise `server/` with `npm init`, install TypeScript, Express, and types
4. Configure TypeScript for both (`tsconfig.json` for each)
5. Set up Tailwind CSS and shadcn/ui in the client
6. Add a root-level `README.md` and `.gitignore`
7. Set up `ts-node-dev` or `tsx` for backend auto-reloading in development
8. Create `.env.example` in server/

**How to test it**: `npm run dev` in client shows the Vite React welcome page. `npm run dev` in server starts Express and responds to `GET /api/health` with `{ status: "ok" }`.

**Key detail**: Set up a `dev` script in the root `package.json` that starts both client and server simultaneously using `concurrently`.

---

### Phase 2: Database Setup

**You learn**: SQL fundamentals — creating tables, inserting data, querying data.

**What to build:**
1. Install `better-sqlite3` and its TypeScript types
2. Write `schema.sql` with all table definitions from the schema section above
3. Write `connection.ts` — opens (or creates) the database file on startup, runs `schema.sql` if tables don't exist
4. Write query helper functions in `db/queries/`:
   - `users.ts`: `createUser()`, `findUserByEmail()`, `findUserById()`
   - `profiles.ts`: `getProfile()`, `upsertProfile()`, `setRestrictions()`, `setDislikedIngredients()`
   - `meals.ts`: `createMeal()`, `getMealsByUser()`, `updateMealStatus()`
5. Enable WAL mode for SQLite (`PRAGMA journal_mode=WAL`) — better performance for reads while writing
6. Create all indexes from the schema section

**How to test it**: Write a small temporary script (`server/src/db/test-db.ts`) that creates a user, adds a profile, inserts a fake meal, and queries it back. Run with `tsx server/src/db/test-db.ts` and verify the output.

**Key detail**: Use `db.prepare(sql).run(params)` syntax — `better-sqlite3` is synchronous (no `async/await` needed), which is simpler to learn with.

---

### Phase 3: Auth

**You learn**: Password hashing, JWTs, middleware, protected routes.

**What to build:**
1. Install `bcrypt`, `jsonwebtoken`, `express-rate-limit` and their type packages
2. Write `POST /api/auth/register`:
   - Validate email format and password length
   - Check if email already exists (409 Conflict if so)
   - Hash password with bcrypt (12 rounds)
   - Insert user into database
   - Generate JWT with `{ userId, email }`, return it
3. Write `POST /api/auth/login`:
   - Find user by email (401 if not found)
   - Compare password with bcrypt (401 if wrong)
   - Generate and return JWT
4. Write auth middleware (`middleware/auth.ts`):
   - Extract token from `Authorization: Bearer <token>` header
   - Verify and decode JWT
   - Attach `req.user = { userId, email }` to the request
   - Return 401 if token is missing, expired, or invalid
5. Apply rate limiting to auth routes
6. Add `GET /api/auth/me` — a protected test route that returns the current user

**How to test it**: Use a REST client (VS Code REST Client extension, or `curl`):
- Register a user → get a token back
- Login with that user → get a token back
- Call `GET /api/auth/me` with the token → see user data
- Call `GET /api/auth/me` without a token → get 401

**Key detail**: Create a small error-handling middleware that catches errors and returns consistent `{ error: "message" }` JSON responses with appropriate status codes.

---

### Phase 4: Profile API Routes

**You learn**: CRUD operations, connecting auth to data, request validation.

**What to build:**
1. Write all profile routes from the API Routes section (all protected with auth middleware)
2. Add input validation — use a small validation helper or a library like `zod`:
   - Calorie target: positive integer, max 10000
   - Macros: non-negative numbers
   - Cuisine preferences: array of strings
   - Restrictions: must be from the allowed values list
   - Cook time: positive integer, max 480 (8 hours)
3. Wire up the query functions from Phase 2 to the route handlers
4. Handle edge cases: profile doesn't exist yet (create on first PUT), user tries to access another user's profile (403)

**How to test it**: Use REST client:
- Create a profile with macro targets
- Add dietary restrictions
- Add disliked ingredients
- GET the full profile and verify everything comes back correctly
- Try invalid data (negative calories, unknown restriction) and verify error responses

**Key detail**: Install `zod` for input validation. It plays well with TypeScript and gives you runtime type checking that matches your type definitions.

---

### Phase 5: AI Meal Generation

**You learn**: External API integration, structured output, data validation.

**What to build:**
1. Install `@anthropic-ai/sdk`
2. Create `services/ai.ts`:
   - Function `generateMeal(profile, restrictions, dislikedIngredients, recentMeals)` that:
     - Constructs the system prompt and user message (as designed above)
     - Calls Claude API with the `create_meal` tool definition
     - Extracts the structured data from the tool_use response
     - Runs validation checks (macro consistency, calorie range, etc.)
     - Returns the validated meal data
3. Create `POST /api/meals/generate` route:
   - Load the user's profile, restrictions, and disliked ingredients from DB
   - Load last 5 accepted meal titles for variety
   - Call `generateMeal()` with this context
   - Save the generated meal to the database
   - Return the meal to the client
4. Create `GET /api/meals` route (paginated, filterable by status)
5. Create `PATCH /api/meals/:id` route (accept/reject)
6. Add a retry mechanism: if validation fails, retry once with a note in the prompt about what went wrong

**How to test it**: REST client:
- Set up a profile first (from Phase 4)
- Hit `POST /api/meals/generate` → get a full meal back with macros
- Check that the macros roughly match your targets
- Accept or reject the meal
- Generate another and verify it doesn't repeat the accepted one
- Query meal history with different filters

**Key detail**: Log the raw AI response to console during development so you can see exactly what Claude returns. This is invaluable for debugging prompt issues.

---

### Phase 6: Frontend — Layout and Auth

**You learn**: Connecting React to a backend API, auth state management, routing.

**What to build:**
1. Install React Router (`react-router-dom`)
2. Create the API client (`lib/api.ts`):
   - A wrapper around `fetch` that automatically adds the JWT header
   - Handles 401 responses by redirecting to login
   - Handles error responses consistently
3. Create `hooks/useAuth.ts`:
   - Stores JWT and user in React state
   - Provides `login()`, `register()`, `logout()` functions
   - Checks for existing auth on app load
4. Set up pages/routes:
   - `/login` — login form
   - `/register` — register form
   - `/` — main app (protected, redirects to login if not authenticated)
   - `/profile` — profile settings
   - `/history` — meal history
5. Build the app shell layout:
   - Simple header with navigation (Home, Profile, History, Logout)
   - Responsive layout using Tailwind

**shadcn/ui components to install for this phase**: `button`, `input`, `label`, `card`, `navigation-menu`, `toast` (for error/success messages).

**How to test it**: Register, log in, see the main page. Log out, try to access main page, get redirected to login. Refresh the page and stay logged in.

**Key detail**: Store the JWT in an `httpOnly` cookie set by the server for persistence across refreshes, but also keep it in React state for the Authorization header. This requires adding a `GET /api/auth/me` endpoint that reads the cookie and returns user data on page load.

---

### Phase 7: Frontend — Profile Setup

**You learn**: Forms with complex state, multi-step data entry, optimistic UI.

**What to build:**
1. Profile page with sections:
   - **Macro targets**: calorie, protein, carb, fat inputs with sensible defaults
   - **Dietary restrictions**: Multi-select grouped by category (lifestyle, allergy, religious, medical). Use checkboxes or a tag-selector pattern.
   - **Cuisine preferences**: Multi-select from a predefined list (Italian, Japanese, Mexican, Indian, Thai, Chinese, Mediterranean, American, Korean, Middle Eastern, French, British, Ethiopian, Vietnamese, Greek)
   - **Disliked ingredients**: Text input with "add" button, displays as removable tags
   - **Max cook time**: Slider or number input (15–120 minutes)
2. Save button that sends all profile data to the API
3. Load existing profile on page mount
4. Show success/error toasts

**shadcn/ui components to install**: `checkbox`, `slider`, `badge`, `separator`, `select`, `tabs` (to group restriction categories).

**How to test it**: Fill out the profile, save, refresh the page, verify everything persists. Try edge cases: empty profile, very high/low numbers, duplicate disliked ingredients.

---

### Phase 8: Frontend — Meal Generation

**You learn**: Loading states, async user flows, conditional rendering.

**What to build:**
1. Main page — the meal generation screen:
   - A "Generate Meal" button (prominent, centre-stage)
   - Loading state while AI generates (spinner + "Creating your meal..." message — expect 3–8 seconds)
   - Meal display card showing:
     - Title and description
     - Macro summary (calories, protein, carbs, fat) with visual bars or badges showing how close they are to targets
     - Ingredients list with quantities
     - Step-by-step instructions (collapsible/expandable)
     - Cook time and cuisine tag
   - Accept / Reject buttons below the meal card
   - After accepting/rejecting, option to generate another
2. If the user hasn't set up a profile yet, show a prompt to complete their profile first (with link to profile page)

**shadcn/ui components to install**: `progress`, `accordion` (for instructions), `skeleton` (for loading state), `alert`.

**How to test it**: Generate a meal, see it appear with full details. Accept it. Generate another — verify it's different. Reject one. Check it all feels smooth.

---

### Phase 9: Frontend — Meal History

**You learn**: Pagination, filtering, list rendering.

**What to build:**
1. History page showing past generated meals:
   - Filter tabs: All / Accepted / Rejected
   - Each meal shown as a compact card (title, macros, date, status badge)
   - Click a card to expand full details (or navigate to a detail view)
   - Pagination (20 meals per page, "Load more" button)
2. Show an empty state if no meals exist yet

**shadcn/ui components to install**: `table` or just cards, `pagination`, `dropdown-menu` (for sort options if desired).

**How to test it**: Generate and accept/reject several meals. Verify they appear in history. Test the filters. Test pagination (may need to generate many meals to test — you could also temporarily insert fake data).

---

### Phase 10: Polish and Deploy

**You learn**: Production deployment, environment configuration, CORS, build processes.

**What to build:**
1. **Error handling polish**: Ensure all API errors show user-friendly messages in the UI, not raw error text
2. **CORS configuration**: Set up Express CORS middleware to allow requests from your Vercel frontend domain
3. **Environment-based config**: Use `.env` for local dev, Render/Vercel environment variables for production
4. **Build process**:
   - Client: `npm run build` produces static files → deploy to Vercel
   - Server: Compile TypeScript → deploy to Render with a start script
5. **Deploy**:
   - Push to GitHub
   - Connect Vercel to the repo's `client/` directory
   - Connect Render to the repo's `server/` directory with persistent disk for SQLite
   - Set environment variables on both platforms
6. **Smoke test**: Register a new account on the live app, set up a profile, generate a meal, accept it, check history

**Final checks:**
- `.env` is in `.gitignore` (critical — your API key and JWT secret must not be in the repo)
- `README.md` explains what the project is, how to run it locally, and what tech is used (good for your portfolio)
- No hardcoded localhost URLs — use environment variables for the API base URL

---

## Future Enhancements (Post v1 — Don't Build Yet)

These are noted here so the v1 architecture doesn't accidentally make them hard to add later.

| Feature | What it changes |
|---------|----------------|
| Feedback-driven improvement | Add a `feedback` column to meals table. Include past feedback in AI prompts. |
| Weekly meal plans | New `meal_plans` table linking multiple meals to dates/slots. Batch AI generation. |
| Bulk/cut toggle | Add `mode` column to profiles. Adjust macro targets per mode. Auto-scale portions. |
| Multiple meal slots | Add `meal_type` (breakfast/lunch/dinner/snack) to meals. Per-slot calorie allocation. |
| Pantry/shop integration | New `pantry_items` table. Constrain AI generation to available ingredients. |
| Shopping list | Derived from a meal plan — aggregate ingredients across meals, deduplicate, format. |
| Household sharing | Multi-user profiles linked to a household. Shared meal plans. Complex but the auth + DB foundation supports it. |

---

## Claude Code Prompt Strategy

When working with Claude Code, give it **one phase at a time**. Start each phase by sharing this plan and saying which phase you're on. A good pattern:

```
Here is my project plan: [paste relevant section]

I'm starting Phase X. Here's what's already built: [brief summary]

Please implement [specific thing from the phase].
```

Keep commits small and frequent — one per meaningful change. This makes it easy to undo mistakes and track progress.


