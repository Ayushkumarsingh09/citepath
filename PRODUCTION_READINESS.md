# Production Readiness Backlog — CitePath

Focus: harden, test, observe, operate. Not feature cloning.

## Critical

| Item | Status | Notes |
|------|--------|-------|
| Live Stripe (checkout, webhooks, portal) | BLOCKED | Needs `STRIPE_*` credentials |
| Production secrets management | DONE (process) | `docs/SECRETS.md` + `.env.example`; inject via secret manager at deploy |
| Playwright E2E regression | DONE (baseline) | `tests/e2e/critical.spec.ts` + CI job |
| CI/CD pipeline | DONE | `.github/workflows/ci.yml` — unit, migrate, build, e2e |
| Backups & DR | DOCUMENTED | `docs/DEPLOYMENT.md` runbook |

## High

| Item | Status | Notes |
|------|--------|-------|
| Slack integration | BLOCKED | Needs OAuth credentials |
| Monitoring (Sentry/OTel) | PARTIAL | Request IDs + security headers; add `SENTRY_DSN` next |
| Security audit | PARTIAL | Rate limits, audit log, tenant isolation test, `pnpm audit` in CI |

## Pre-launch verification checklist

- [x] Health `/health` and readiness `/ready`
- [x] DB schema migratable (`prisma migrate`)
- [x] API key create + revoke + rotate
- [x] Rate limiting on auth + agent API
- [x] Tenant isolation tests
- [x] Audit log on auth / key lifecycle / draft approve
- [x] Worker exponential backoff + DLQ queue
- [ ] Billing webhook replay protection (needs Stripe)
- [ ] Email deliverability (needs provider)
- [ ] Redis outage soak test
- [ ] Postgres failover (infra-specific)
- [ ] Object storage ACL verification
- [ ] Concurrent load test
- [ ] Extension store publish flow
- [ ] WCAG audit pass
- [ ] License compliance report

## Differentiation bets (product)

1. Opportunity score explainability (already persisted `scoreExplain`)
2. Stronger knowledge/RAG controls
3. Extensible Agent API
4. Analytics + attribution
5. Team collaboration depth
