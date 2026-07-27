# Deployment

## Secrets management

Never commit `.env` / `.env.local`. Inject secrets via your host:

- Docker/K8s secrets
- Cloud secret managers (AWS Secrets Manager, GCP Secret Manager, Doppler, Infisical)
- GitHub Actions encrypted secrets for CI only

See `docs/SECRETS.md`.

## Database

Fresh environment:

```bash
pnpm db:generate
pnpm db:migrate:deploy
pnpm db:seed   # optional demo only — skip in prod
```

## Backups & DR (runbook)

1. Daily `pg_dump` of production DB to object storage (encrypted).
2. Retain 7 daily + 4 weekly snapshots minimum.
3. Test restore quarterly onto a staging instance.
4. Redis is ephemeral — durable state lives in Postgres (`JobRecord`, drafts, etc.).
5. Document RPO/RTO with your host (e.g. RPO ≤ 24h, RTO ≤ 4h for starter ops).

## Health

- `GET /health` — liveness
- `GET /ready` — Postgres reachable

## Workers

```bash
pnpm --filter @citepath/worker start
```

Jobs use exponential backoff (5 attempts) and BullMQ dead-letter queue `citepath-dlq`.

## App

```bash
pnpm --filter @citepath/web build
pnpm --filter @citepath/web start
```
