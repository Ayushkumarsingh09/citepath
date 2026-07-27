# Feature Matrix

Legend — Implementation status for CitePath clone. Confidence = reference evidence.

| Feature ID | Feature name | Module | Description | Entry | Permissions | Confidence | Impl | Tests | Parity |
|------------|--------------|--------|-------------|-------|-------------|------------|------|-------|--------|
| F001 | Signup/Login | Auth | Email/password auth, session | /signup /login | public | CONFIRMED | IMPLEMENTING | — | DISCOVERED |
| F002 | Email verification | Auth | Verify email | email link | user | HIGH | PENDING | — | DISCOVERED |
| F003 | Password reset | Auth | Reset flow | /login | public | HIGH | PENDING | — | DISCOVERED |
| F004 | Onboarding 8-step | Onboarding | Solo/Team, campaign, advocate, subs, reddit acct, extension, drafts | /onboarding | member | CONFIRMED | IMPLEMENTING | — | SPECIFIED |
| F005 | Workspace Solo/Team | Org | Immutable after creation | onboarding | owner | CONFIRMED | IMPLEMENTING | — | SPECIFIED |
| F006 | Org switcher | Org | Create new org if need Team | sidebar | owner | CONFIRMED | PENDING | — | SPECIFIED |
| F007 | RBAC roles | Authz | owner / admin / member | settings/org | owner/admin | CONFIRMED | IMPLEMENTING | — | SPECIFIED |
| F008 | Team invites | Org | Invite by email | settings/org | owner/admin | CONFIRMED | PENDING | — | SPECIFIED |
| F009 | Dashboard | Core | Super-relevant drafts, scan status, warmup, warnings, activity | /dashboard | member | CONFIRMED | IMPLEMENTING | — | SPECIFIED |
| F010 | Scan Now | Scanner | Trigger subreddit scan | dashboard | member | CONFIRMED | IMPLEMENTING | — | SPECIFIED |
| F011 | Performance | Analytics | Views, upvotes, score by campaign/sub 7/14/30 | /performance | member | CONFIRMED | PENDING | — | SPECIFIED |
| F012 | Sync Now | Extension | Extension refreshes metrics | /performance | member | CONFIRMED | PENDING | — | SPECIFIED |
| F013 | Karma Journey | Safety | Milestones, ratio, unlock timeline | /journey | member | CONFIRMED | PENDING | — | SPECIFIED |
| F014 | Drafts queue | Drafts | Tabs All/Waiting/Queue/Published/Archive | /drafts | member | CONFIRMED | IMPLEMENTING | — | SPECIFIED |
| F015 | Draft Approve | Drafts | → Queued for extension | /drafts | member | CONFIRMED | IMPLEMENTING | — | SPECIFIED |
| F016 | Copy & Open | Drafts | Clipboard + open thread; mark posted | /drafts | member | CONFIRMED | IMPLEMENTING | — | SPECIFIED |
| F017 | Warmup vs Promo drafts | Drafts | Type tagging by promotional ratio | drafts | system | CONFIRMED | IMPLEMENTING | — | SPECIFIED |
| F018 | Campaigns CRUD | Campaigns | Product/topic containers; toggle active | /campaigns | member | CONFIRMED | IMPLEMENTING | — | SPECIFIED |
| F019 | Campaign teammates | Campaigns | Assign approval responsibility | campaign detail | admin | CONFIRMED | PENDING | — | SPECIFIED |
| F020 | Knowledge Base | RAG | PDF/MD/TXT upload; site crawl max 100 pages | campaign | member | CONFIRMED | PENDING | — | SPECIFIED |
| F021 | Advocates | Advocates | Persona wizard 5 steps | /advocates | member | CONFIRMED | IMPLEMENTING | — | SPECIFIED |
| F022 | Advocate Refine | Advocates | Rewrite 5 samples → voice guidelines | /advocates/[id]/refine | member | CONFIRMED | PENDING | — | SPECIFIED |
| F023 | Reddit Accounts | Accounts | Username lookup (no password); karma/age/verified/mod | /accounts | member | CONFIRMED | IMPLEMENTING | — | SPECIFIED |
| F024 | Subreddits | Subs | Filter, bulk toggle, assign, CSV import, Discover | /subreddits | member | CONFIRMED | IMPLEMENTING | — | SPECIFIED |
| F025 | Opportunity scoring | Engine | Relevance threshold Strict/Balanced/Lenient | scanner | system | CONFIRMED (threshold) | IMPLEMENTING | — | SPECIFIED |
| F026 | Brand Monitor | BM | Overview/Mentions/Subreddits/Brands | /brand-monitor | gated | CONFIRMED | PENDING | — | SPECIFIED |
| F027 | AI Visibility | GEO | Overview/Prompts/Sources/Brands; multi-engine | /ai-visibility | gated | CONFIRMED | PENDING | — | SPECIFIED |
| F028 | Prompt bulk import | GEO | Manual / CLI / MCP | prompts | member | CONFIRMED | PENDING | — | SPECIFIED |
| F029 | Chrome Extension | Ext | Post, sync metrics, karma; auth callback | chrome | member | CONFIRMED | PENDING | — | SPECIFIED |
| F030 | Extension Activity | Ext | Settings → Activity feed | settings/activity | member | CONFIRMED | PENDING | — | SPECIFIED |
| F031 | Account warmup ramp | Safety | Day 1–7 posting pace | system | system | CONFIRMED | IMPLEMENTING | — | SPECIFIED |
| F032 | Promotional ratio | Safety | 0→80% by karma tiers | system | system | CONFIRMED | IMPLEMENTING | — | SPECIFIED |
| F033 | Settings General | Settings | AI Relevance Threshold | settings | member | CONFIRMED | IMPLEMENTING | — | SPECIFIED |
| F034 | Scan History | Settings | Last 10 runs | settings | member | CONFIRMED | IMPLEMENTING | — | SPECIFIED |
| F035 | Notifications prefs | Settings | Email + extension push | settings | member | CONFIRMED | PENDING | — | SPECIFIED |
| F036 | Billing Stripe | Billing | Trial 14d, portal, add-ons | settings/billing | owner/admin | CONFIRMED | PENDING | — | SPECIFIED |
| F037 | Entitlements | Billing | Enforce plan caps server-side | all gated | system | CONFIRMED | IMPLEMENTING | — | SPECIFIED |
| F038 | API Keys | Agent API | `cp_` prefix (ours; ref uses `rg_`) | settings/api-keys | member | CONFIRMED | PENDING | — | SPECIFIED |
| F039 | Agent API | Agent API | Subreddits/posts/users/domains | api | key | CONFIRMED | PENDING | — | SPECIFIED |
| F040 | CLI | Agent API | Package CLI | npm | key | CONFIRMED | PENDING | — | SPECIFIED |
| F041 | Slack integration | Integrations | Daily digest 09:00 UTC | settings | Growth+ | CONFIRMED | PENDING | — | SPECIFIED |
| F042 | Community Mgmt | Community | Moderate with KB | marketing | UNKNOWN | LOW | BLOCKED | — | UNKNOWN |
| F043 | Free visibility report | Marketing | Lead form | homepage | public | CONFIRMED | PENDING | — | SPECIFIED |
| F044 | Analytics charts | Analytics | Real stored events only | /performance etc | member | HIGH | PENDING | — | SPECIFIED |

## Business rules (CONFIRMED)

- Workspace Solo/Team immutable after onboarding
- Hierarchy: Campaign → Advocate → Reddit Account (1 account per advocate)
- Daily draft quota per advocate; resets midnight UTC
- Relevance: Strict 70% / Balanced 50% / Lenient 45%
- Promo ratio: 0k→0%, 10→20%, 50→40%, 100→60%, 500+→80%
- Warmup: D1–2 browse, D3–4 1/day, D5–6 2/day, D7+ full pace
- KB site crawl max 100 pages
- Extension posts once/day random window
- Double-post prevention on draft queue
