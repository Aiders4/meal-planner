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
   cd client && npm install
   cd ../server && npm install
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
   # From the root directory
   npm run dev
   ```
   This starts both the client (Vite) and server (Express) concurrently.

## Features

- **User accounts** with secure email/password authentication
- **Profile setup** — calorie targets, macro goals (protein/carbs/fat), cuisine preferences, max cook time
- **Dietary restrictions** — lifestyle (vegetarian, vegan, etc.), allergies, religious, and medical restrictions
- **Disliked ingredients** — tell the AI what to avoid
- **AI meal generation** — generates meals matching all your constraints with full nutritional info
- **Accept/reject flow** — review meals and build a history of ones you like
- **Meal history** — browse, filter, and revisit past meals

## Deployment

- **Frontend**: Vercel (static build from `client/`)
- **Backend**: Render (Node.js with persistent disk for SQLite)