# AI Meal Planner

Define your dietary constraints and macro targets once — get AI-generated meals that actually work for you.

## What It Does

A web app where you set up your nutritional goals, dietary restrictions, and food preferences, then AI generates meal ideas that fit all of them. Each meal comes with full ingredients, step-by-step instructions, and accurate macro breakdowns.

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React + TypeScript + Vite |
| UI | shadcn/ui + Tailwind CSS |
| Backend | Node.js + Express + TypeScript |
| Database | SQLite via `better-sqlite3` (raw SQL, no ORM) |
| AI | Claude API (Haiku) via `@anthropic-ai/sdk` |
| Auth | Email/password with bcrypt + JWT |

## Project Structure

```
meal-planner/
├── client/          # React frontend
│   └── src/
│       ├── components/
│       ├── pages/
│       ├── hooks/
│       ├── lib/
│       └── types/
├── server/          # Express backend
│   └── src/
│       ├── routes/
│       ├── middleware/
│       ├── db/
│       ├── services/
│       └── types/
└── README.md
```

## Getting Started

### Prerequisites

- Node.js 20+
- npm
- An [Anthropic API key](https://console.anthropic.com)

### Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/<your-username>/meal-planner.git
   cd meal-planner
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables:
   ```bash
   cp server/.env.example server/.env
   ```
   Then edit `server/.env` with your actual values:
   ```env
   PORT=3001
   JWT_SECRET=generate-a-random-64-char-string-here
   DATABASE_PATH=./data/meal-planner.db
   ANTHROPIC_API_KEY=sk-ant-your-key-here
   ```

4. Start the development servers:
   ```bash
   npm run dev
   ```
   This starts both the client (port 5173) and server (port 3001) concurrently. The Vite dev server proxies `/api` requests to the backend.

## Features

- **User accounts** with secure email/password authentication
- **Profile setup** — calorie targets, macro goals (protein/carbs/fat), cuisine preferences, max cook time
- **Dietary restrictions** — lifestyle (vegetarian, vegan, etc.), allergies, religious, and medical restrictions
- **Disliked ingredients** — tell the AI what to avoid
- **AI meal generation** — generates meals matching all your constraints with full nutritional info
- **Accept/reject flow** — review meals and build a history of ones you like
- **Meal history** — browse, filter, and revisit past meals

## Deployment

### Backend — Render

1. Create a new **Web Service** on [Render](https://render.com)
2. Connect your repository
3. Configure:
   - **Root Directory**: `server`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Runtime**: Node
4. Add a **Persistent Disk**:
   - **Mount Path**: `/data`
5. Set **Environment Variables**:
   | Variable | Value |
   |----------|-------|
   | `PORT` | `3001` (or let Render assign) |
   | `JWT_SECRET` | A random 64-character string |
   | `DATABASE_PATH` | `/data/meal-planner.db` |
   | `ANTHROPIC_API_KEY` | Your Anthropic API key |
   | `CORS_ORIGIN` | Your Vercel frontend URL (e.g. `https://your-app.vercel.app`) |

### Frontend — Vercel

1. Create a new project on [Vercel](https://vercel.com)
2. Connect your repository
3. Configure:
   - **Root Directory**: `client`
   - **Framework Preset**: Vite
4. Set **Environment Variables**:
   | Variable | Value |
   |----------|-------|
   | `VITE_API_URL` | Your Render backend URL (e.g. `https://your-api.onrender.com`) |

### Post-Deployment Checklist

- [ ] Register a new account
- [ ] Set up profile with macro targets and restrictions
- [ ] Generate a meal — verify AI response with ingredients and macros
- [ ] Accept the meal
- [ ] Check meal history — verify the accepted meal appears
- [ ] Test dark mode toggle
- [ ] Verify rate limiting works (10 generations per 15 min)
