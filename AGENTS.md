<!-- antislop:start -->
## antislop
For UI, copy, people, mobile layout, or code comments work, read `antislop.md` (core) and then the skill for the task:
- UI / visual: `skills/antislop-ui/SKILL.md`
- Code comments: `skills/antislop-code/SKILL.md`
Before starting, ask the user when antislop applies: during the work, or after it is done.
<!-- antislop:end -->

# WORKNOON Refund System

## Project Overview

AI-powered customer support refund system. Customers submit refund requests through a chat interface, an AI evaluator (Gemini via Vercel AI SDK) processes the request against a refund policy, and support staff review decisions on an admin dashboard.

## Tech Stack

- **Backend:** NestJS 12 + TypeScript + Prisma + PostgreSQL
- **Frontend:** TanStack Start + TanStack Router + TanStack Query + Tailwind CSS
- **AI:** Vercel AI SDK + Google Gemini 2.5 Flash (`@ai-sdk/google`)
- **Database:** PostgreSQL (Neon)
- **Deployment:** Vercel (frontend + backend), Docker Compose (local)

## Code Style

- Prettier: 4-space tabs, single quotes, trailing commas, printWidth 120 (frontend) / 100 (backend)
- TypeScript: strict, exactOptionalPropertyTypes, noUncheckedIndexedAccess, noImplicitOverride
- Custom ESLint rules: query-hook-suffix, mutation-hook-suffix, no-direct-localstorage
- Dependency flow: Routes → queries/ → services/ → apiClient (never routes → services directly)

## Architecture

```
Customer submits refund request
        │
        ▼
┌─────────────────────┐
│  Refund Engine       │  Hard rules checked first (no AI needed)
│  - Order exists?     │
│  - Within 30 days?   │
│  - Final sale item?  │
│  - Amount > $500?    │
└────────┬────────────┘
         │ (if rules pass or ambiguous)
         ▼
┌─────────────────────┐
│  AI Evaluator        │  Vercel AI SDK + Gemini with structured output
│  - Customer context  │
│  - Order + items     │
│  - Policy document   │
│  - Customer message  │
│  → Decision + reason │
└────────┬────────────┘
         │
         ▼
   Save to DB → Return to frontend
```

## Running Locally

```bash
# 1. Install dependencies
cd backend && pnpm install
cd ../frontend && pnpm install

# 2. Set up database
cd backend
cp ../.env.example .env  # Fill in DATABASE_URL
pnpm prisma:generate
pnpm prisma:migrate:dev
pnpm prisma:seed

# 3. Start backend
pnpm start:dev  # Runs on :3001

# 4. Start frontend
cd ../frontend
pnpm dev  # Runs on :3000

# Or use Docker Compose from root:
docker-compose up
```

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string (Neon) | Yes |
| `GOOGLE_GENERATIVE_AI_API_KEY` | Google Gemini API key | Yes |
| `PORT` | Backend port (default: 3001) | No |
| `VITE_API_URL` | Backend URL for frontend (default: http://localhost:3001) | No |
