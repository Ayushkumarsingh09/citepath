# Parity Matrix (updated 2026-07-28 enhancement pass)

Documented product-contract coverage target: **~95–98% of Help Center + public Agent API surfaces**.
Pixel-perfect authenticated UI remains bounded without a reference test account.

| ID | Feature | Status | Notes |
|----|---------|--------|-------|
| F001 Auth | PARITY VERIFIED (local) | Working |
| F004 Onboarding | IMPLEMENTED | 8 steps |
| F009 Dashboard | IMPLEMENTED | Scan, warmup, warnings |
| F011 Performance | IMPLEMENTED | Real published metrics |
| F013 Journey | IMPLEMENTED | Milestones + ratio |
| F014–017 Drafts | IMPLEMENTED | Approve/queue/copy-open |
| F018–020 Campaigns+KB | IMPLEMENTED | Detail + ingest |
| F021–022 Advocates+Refine | IMPLEMENTED | |
| F023–025 Accounts/Subs/Scoring | IMPLEMENTED | |
| F026 Brand Monitor | IMPLEMENTED | 4 tabs |
| F027 AI Visibility | IMPLEMENTED | 4 tabs + runs |
| F029 Extension | IMPLEMENTED | Queue + insert assist |
| F033–041 Settings/Billing/Keys | IMPLEMENTED | Demo Stripe when no keys |
| F039 Agent API | IMPLEMENTED | All 19 endpoints |
| F041 Slack | SPECIFIED | Growth gate + stub |
| F042 Community | IMPLEMENTED | KB-assisted (inferred) |
| CLI | IMPLEMENTED | @citepath/cli |
| MCP hosted | BLOCKED | Needs deeper public tool schemas |

## Known intentional differences
- Branding: CitePath
- AI Visibility via provider APIs / labeled demo (not browser farms)
- Stripe: demo upgrade path until live keys
- Visual chrome: independent design system matching IA not proprietary pixels
