# Local development

## Prerequisites

- Node 20+
- pnpm 9+
- Docker (Postgres 16 + Redis 7)

## Steps

1. `docker compose -f infrastructure/docker-compose.yml up -d`
2. `cp .env.example .env` and `cp .env.example apps/web/.env.local`
3. Ensure `DATABASE_URL` and `DEMO_MODE=true` in both env files for local
4. `pnpm install`
5. `pnpm db:generate && pnpm db:push && pnpm db:seed`
6. `pnpm dev`

## Tests

```bash
pnpm --filter @citepath/shared test
```

## Health

- `GET /health`
- `GET /ready`
