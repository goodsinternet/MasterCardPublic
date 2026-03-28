# CardMaker

AI-powered product card generator for Russian marketplaces (Wildberries, Ozon, Яндекс.Маркет).

## Project Location

All source code lives in `Screen-Image-Builder/`. The archive `ReplitExport-a9043948771.tar.gz` was extracted into this directory.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm (v10)
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Frontend**: React 19 + Vite 7 + Tailwind CSS v4 + Radix UI (Shadcn)
- **AI**: OpenAI GPT-4o Vision (card text), KIE AI / Nano Banana PRO (card images, optional)
- **Auth**: JWT + bcryptjs, sessions stored in PostgreSQL

## Workflows

- **Start application** — Vite dev server for the React frontend on port 5000
  - Command: `cd Screen-Image-Builder && PORT=5000 BASE_PATH=/ pnpm --filter @workspace/cardmaker run dev`
- **API Server** — Express backend on port 8080
  - Command: `cd Screen-Image-Builder && PORT=8080 pnpm --filter @workspace/api-server run dev`

The Vite dev server proxies `/api` requests to `http://localhost:8080`.

## Required Environment Secrets

- `OPENAI_API_KEY` — Required. Used for GPT-4o Vision card text generation.
- `KIE_AI_API_KEY` — Optional. Used for card image generation via KIE AI.
- `JWT_SECRET` — Optional (defaults to dev key). Set in production for security.

## Features

- User auth with JWT (register/login/logout)
- 3 free generations on register
- Referral system: +2 for referred user, +1 for referrer
- Upload up to 5 product images
- AI-generates SEO title, description, characteristics, keywords, category, and tips
- Optional AI-generated card image (requires KIE_AI_API_KEY)
- Full history of generated cards in Dashboard

## API Routes (all under /api, served on port 8080)

- `GET /api/healthz` — health check
- `POST /api/auth/register` — register with optional referral code
- `POST /api/auth/login` — login
- `POST /api/auth/logout` — logout
- `GET /api/user` — profile + generations count + referral info
- `POST /api/generate` — AI card generation (requires auth, image base64, marketplace)
- `GET /api/generate` — list user's generations
- `POST /api/referral/apply` — apply a referral code

## Project Structure

```
Screen-Image-Builder/
├── artifacts/
│   ├── api-server/         Express 5 API (TypeScript, esbuild bundle)
│   └── cardmaker/          React + Vite frontend
├── lib/
│   ├── api-spec/           OpenAPI spec + Orval codegen config
│   ├── api-client-react/   Generated React Query hooks
│   ├── api-zod/            Generated Zod schemas
│   └── db/                 Drizzle ORM schema + DB connection
├── scripts/                Utility scripts
├── pnpm-workspace.yaml
└── package.json
```

## Database

Run migrations in development:
```
cd Screen-Image-Builder && pnpm --filter @workspace/db run push
```
