# Decision Log

## 2026-07-28 — Independent brand CitePath

**Context:** Must not ship as ReddGrow.  
**Decision:** Product name CitePath; API key prefix `cp_`.  
**Alternatives:** ThreadSight, ReplyForge.  
**Rationale:** Clear GEO positioning without trademark collision.  
**Consequences:** All UI copy uses CitePath.

## 2026-07-28 — Next.js full-stack + worker

**Context:** Empty repo; need fast vertical slices.  
**Decision:** Next.js App Router API routes + separate BullMQ worker; Prisma.  
**Alternatives:** NestJS+Next, FastAPI+Next.  
**Rationale:** Shared TS types; one deployable web app; worker isolated for jobs.  
**Consequences:** Heavy logic lives in `packages/*` and `apps/worker`, not only route handlers.

## 2026-07-28 — Pricing baseline from Help Center

**Context:** Conflicting public prices.  
**Decision:** Starter $59 / Growth $149 / Pro $299 monthly; −20% annual; add-ons as Help Center.  
**Alternatives:** Marketing homepage annual figures.  
**Rationale:** Help Center is most operationally detailed.  
**Consequences:** Marketing page copy must match entitlements table in code.

## 2026-07-28 — AI Visibility via provider APIs

**Context:** Reference claims querying “as real users.”  
**Decision:** Use supported AI provider APIs for query runs; document intentional difference.  
**Alternatives:** Browser automation (fragile, ToS risk).  
**Rationale:** Lawful, reliable, auditable.  
**Consequences:** U06 remains a known difference in FINAL_AUDIT.
