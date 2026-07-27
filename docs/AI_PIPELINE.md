# AI Pipeline

## Opportunity scoring

Configurable weights in `@citepath/shared` → `computeOpportunityScore`.

## Draft generation

`apps/web/src/lib/ai.ts` — OpenAI-compatible when `AI_PROVIDER_API_KEY` set; otherwise labeled demo templates.

## Knowledge / RAG

Schema supports documents + chunks with optional embedding JSON. Ingest/rerank workers are next vertical slice.

## AI Visibility

Query runs stored per engine; snapshots aggregate mention/citation rates from observations. Demo observations labeled `isDemo` when no provider key.
