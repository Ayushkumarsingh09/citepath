# Evidence Log

| ID | Date | Source | Method | Finding | Confidence | Notes |
|----|------|--------|--------|---------|------------|-------|
| E001 | 2026-07-28 | https://reddgrow.ai/ | WebFetch | GEO/AI citation positioning; Scan→Match→Draft→Cited funnel; feature modules: AI Visibility, Brand Monitor, AI Drafts, Community Mgmt, Chrome Extension, Analytics | CONFIRMED | Marketing claims marked as marketing |
| E002 | 2026-07-28 | https://reddgrow.ai/help-center/ | WebFetch | Full FAQ: 8-step onboarding, sidebar features, Settings 9 tabs, draft statuses, warmup/karma rules, pricing/add-ons, extension auth via `/extension-auth-callback` | CONFIRMED | Highest-value behavioral source |
| E003 | 2026-07-28 | https://reddgrow.ai/pricing/ | WebFetch | Plans Starter/Growth/Pro/Agency/Enterprise; monthly/yearly; feature lists | CONFIRMED | Dollar amounts conflict across pages (see EDGE_CASES) |
| E004 | 2026-07-28 | https://docs.reddgrow.ai/docs | WebFetch | Agent API for AI agents; endpoints for subreddits/posts/domains/users; CLI `@reddgrow/cli` | CONFIRMED | |
| E005 | 2026-07-28 | https://docs.reddgrow.ai/docs/getting-started | WebFetch | `x-api-key: rg_*`; `GET https://api.reddgrow.ai/agent/me`; credit model 1–5 | CONFIRMED | |
| E006 | 2026-07-28 | https://docs.reddgrow.ai/docs/changelog | WebFetch | v1.0.0 March 2025; 19 endpoints; 5 categories; credit headers; CLI command surface | CONFIRMED | |
| E007 | 2026-07-28 | https://docs.reddgrow.ai/docs/guides | WebFetch | Guides: subreddit research, domain monitoring, agent integration, batch, credits, MCP | CONFIRMED | |
| E008 | 2026-07-28 | Help Center | WebFetch | Hierarchy: Campaign → Advocate → Reddit Account; draft types warmup vs promotional | CONFIRMED | |
| E009 | 2026-07-28 | Help Center | WebFetch | Stripe billing portal; roles owner/admin/member; Slack Growth+ | CONFIRMED | |
| E010 | 2026-07-28 | Repository audit | FS | Workspace empty (greenfield) | CONFIRMED | |

## Secrets policy

No credentials, cookies, or session tokens recorded in this repository.
