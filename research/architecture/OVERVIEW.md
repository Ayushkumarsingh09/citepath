# Architecture — CitePath

Date: 2026-07-28

## Decision

Monorepo with **Next.js App Router (TypeScript)** as the primary web + BFF/API surface, **Prisma + PostgreSQL**, **BullMQ + Redis** workers, **pgvector** for knowledge embeddings, **Manifest V3** extension, independent Agent API under `/agent`.

## Why not NestJS/FastAPI first

Greenfield empty repo; single TypeScript stack maximizes shared types and delivery speed for vertical slices. Worker remains a separate Node process. Can extract Nest/FastAPI later if needed (DECISIONS.md).

## Layout

```
apps/web          Next.js UI + /api/v1 + /agent
apps/worker       BullMQ processors
extension         Chrome MV3
packages/db       Prisma schema + client
packages/shared   Zod schemas, constants, scoring
packages/ui       Shared primitives (optional early: colocate in web)
research/         Black-box evidence
docs/             Operator docs
infrastructure/   Docker Compose
```

## Tenancy

Every tenant entity scoped by `workspaceId`. Middleware loads membership; services assert RBAC.

## Job types

`reddit.scan`, `opportunity.score`, `draft.generate`, `knowledge.ingest`, `mention.monitor`, `visibility.run`, `analytics.aggregate`, `notification.deliver`, `billing.sync`

## Reddit

Public JSON / official Reddit API adapter with rate limits, backoff, cache. Username lookup without storing passwords.

## AI

Provider adapter (OpenAI-compatible). Usage accounting + workspace quotas. Demo mode with deterministic local templates when no API key (explicitly labeled).

## Billing

Stripe Checkout + Customer Portal + webhooks. Entitlements enforced server-side.
