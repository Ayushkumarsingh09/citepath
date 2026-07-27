# Route Map

Auth: Public | Authed | Owner/Admin

| Route | Purpose | Auth | Inputs | Actions | Outputs | API deps | Status | Confidence |
|-------|---------|------|--------|---------|---------|----------|--------|------------|
| `/` | Marketing home | Public | — | CTA trial/demo | — | — | SPECIFIED | CONFIRMED |
| `/pricing` | Plans | Public | billing cycle | Start trial | plans | — | SPECIFIED | CONFIRMED |
| `/help-center` | FAQ | Public | search | browse | FAQ | — | SPECIFIED | CONFIRMED |
| `/login` | Auth | Public | email/password | login | session | auth | IMPLEMENTING | HIGH |
| `/signup` | Registration | Public | email/password/name | register | session | auth | IMPLEMENTING | HIGH |
| `/onboarding` | 8-step setup | Authed | workspace mode, campaign, advocate, subreddits, reddit username, extension | complete | workspace ready | multi | IMPLEMENTING | CONFIRMED (steps) |
| `/dashboard` | Snapshot | Authed | — | Scan Now | drafts, warmup, warnings | dashboard | IMPLEMENTING | CONFIRMED |
| `/performance` | Posted comment metrics | Authed | date range 7/14/30 | Sync Now | views/upvotes/score | performance | SPECIFIED | CONFIRMED |
| `/journey` | Karma milestones | Authed | account | — | milestones, ratio, unlocks | journey | SPECIFIED | CONFIRMED |
| `/drafts` | Draft review queue | Authed | tabs/filters | Approve, Copy&Open, Archive | draft list | drafts | IMPLEMENTING | CONFIRMED |
| `/campaigns` | Campaign list | Authed | — | create/toggle | campaigns | campaigns | IMPLEMENTING | CONFIRMED |
| `/campaigns/[id]` | Campaign detail | Authed | id | edit, assign teammates, KB | campaign | campaigns | SPECIFIED | CONFIRMED |
| `/advocates` | Advocate list | Authed | — | create wizard, add drafts | advocates | advocates | IMPLEMENTING | CONFIRMED |
| `/advocates/[id]` | Advocate detail | Authed | id | configure | advocate | advocates | SPECIFIED | CONFIRMED |
| `/advocates/[id]/refine` | Voice refine | Authed | rewrites | submit | voice guidelines | advocates | SPECIFIED | CONFIRMED |
| `/accounts` | Reddit accounts | Authed | username | connect | account cards | accounts | IMPLEMENTING | CONFIRMED |
| `/subreddits` | Communities | Authed | filters | toggle, assign, import CSV, discover | list | subreddits | IMPLEMENTING | CONFIRMED |
| `/brand-monitor` | BM overview | Authed | date | — | metrics | brand-monitor | SPECIFIED | CONFIRMED |
| `/brand-monitor/mentions` | Mention feed | Authed | search/filters | — | mentions | brand-monitor | SPECIFIED | CONFIRMED |
| `/brand-monitor/subreddits` | BM by sub | Authed | — | — | sentiment | brand-monitor | SPECIFIED | CONFIRMED |
| `/brand-monitor/brands` | Managed brands | Authed | domain | add/remove | brands | brand-monitor | SPECIFIED | CONFIRMED |
| `/ai-visibility` | Visibility overview | Authed | date | — | scores | visibility | SPECIFIED | CONFIRMED |
| `/ai-visibility/prompts` | Tracked prompts | Authed | prompt text | add/import | prompts | visibility | SPECIFIED | CONFIRMED |
| `/ai-visibility/sources` | Cited domains | Authed | — | — | sources | visibility | SPECIFIED | CONFIRMED |
| `/ai-visibility/brands` | Visibility brands | Authed | — | manage | brands | visibility | SPECIFIED | CONFIRMED |
| `/settings` | Settings hub | Authed | tab | update | prefs | settings | IMPLEMENTING | CONFIRMED |
| `/settings/general` | Relevance threshold | Authed | threshold | save | — | settings | SPECIFIED | CONFIRMED |
| `/settings/scan-history` | Last 10 scans | Authed | — | — | log | scans | SPECIFIED | CONFIRMED |
| `/settings/activity` | Extension activity | Authed | — | — | events | activity | SPECIFIED | CONFIRMED |
| `/settings/notifications` | Email/push toggles | Authed | prefs | save | — | notifications | SPECIFIED | CONFIRMED |
| `/settings/account` | Profile/security | Authed | name/email/password | change/delete | — | users | SPECIFIED | CONFIRMED |
| `/settings/billing` | Plan/usage | Owner/Admin | — | portal/upgrade | subscription | billing | SPECIFIED | CONFIRMED |
| `/settings/organization` | Members/invites | Owner/Admin | email/role | invite | members | org | SPECIFIED | CONFIRMED |
| `/settings/api-keys` | Agent API keys | Authed | name | create/revoke | key once | api-keys | SPECIFIED | CONFIRMED |
| `/settings/integrations` | Slack | Growth+ | OAuth | connect | integration | integrations | SPECIFIED | CONFIRMED |
| `/extension-auth-callback` | Extension session bridge | Authed | — | hand token to extension | connected | auth | SPECIFIED | CONFIRMED |

## App sidebar (CONFIRMED from Help Center)

Dashboard, Performance, Journey, Drafts, Campaigns, Advocates, Accounts, Subreddits, Brand Monitor, AI Visibility, Settings
