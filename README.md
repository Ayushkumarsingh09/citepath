# CitePath

**Get cited where AI learns.**

CitePath helps brands discover Reddit threads that AI systems already trust, draft helpful comments with human review, publish via a Chrome extension workflow, and measure visibility across AI answers.

> Independent product. Not affiliated with ReddGrow or Reddit, Inc.

## Live demo

**https://citepath.vercel.app**

> Demo credentials (seed data): `demo@citepath.local` / `demo-demo-demo`  
> Local/demo mode may use labeled synthetic Reddit posts when live providers are unavailable. Set real `DATABASE_URL`, `AI_PROVIDER_API_KEY`, and `STRIPE_*` for full production behavior.

## Features

- **Campaigns & advocates** — product campaigns with AI personas and voice refine
- **Opportunity engine** — explainable multi-factor scoring (relevance, intent, freshness, risk)
- **Drafts workflow** — Pending → Approve (queue) / Copy & Open → Published
- **Karma & warmup** — promotional ratio and account pacing rules
- **Brand Monitor** — mentions, subreddit breakdown, brand list
- **AI Visibility (GEO)** — prompts, query runs, visibility / citation / share-of-voice metrics
- **Knowledge / RAG** — text + URL ingest, chunk retrieval for drafts & community assist
- **Chrome extension (MV3)** — queue assist + insert for human submit
- **Agent API** — 19 Reddit-intelligence endpoints, `cp_` keys, credit headers
- **CLI** — `@citepath/cli` (`citepath auth`, `citepath r …`)
- **Billing entitlements** — plans, add-ons, trial banner (Stripe-ready)
- **Teams** — Solo/Team workspaces, RBAC, invites

## Stack

| Layer | Tech |
|-------|------|
| Web | Next.js 15, TypeScript, Tailwind |
| Data | PostgreSQL, Prisma |
| Jobs | Redis, BullMQ |
| Tests | Vitest, Playwright |
| CI | GitHub Actions |

## Quick start

```bash
# Infra
docker compose -f infrastructure/docker-compose.yml up -d

# Env (Postgres maps to localhost:55432 by default in this repo)
cp .env.example .env
cp .env.example apps/web/.env.local

# Install & DB
pnpm install
pnpm db:generate
pnpm db:migrate:deploy   # or pnpm db:push for local prototyping
pnpm db:seed

# Run
pnpm dev                 # http://localhost:3000
pnpm dev:worker          # optional queue worker
```

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Next.js app |
| `pnpm build` | Production builds |
| `pnpm test` | Unit tests |
| `pnpm test:integration` | Tenant isolation |
| `pnpm test:e2e` | Playwright |
| `pnpm db:migrate:deploy` | Apply migrations |
| `pnpm db:seed` | Demo user |

## Documentation

- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md)
- [`docs/LOCAL_DEVELOPMENT.md`](docs/LOCAL_DEVELOPMENT.md)
- [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md)
- [`docs/SECRETS.md`](docs/SECRETS.md)
- [`docs/API.md`](docs/API.md)
- [`docs/EXTENSION.md`](docs/EXTENSION.md)
- [`PRODUCTION_READINESS.md`](PRODUCTION_READINESS.md)
- [`research/`](research/) — black-box product research & parity matrix

## Agent API (sample)

```bash
curl -H "x-api-key: cp_your_key" https://citepath.vercel.app/agent/me
```

Create keys in **Settings → API Keys** (shown once).

## License

Private / proprietary unless otherwise stated by the repository owner.
