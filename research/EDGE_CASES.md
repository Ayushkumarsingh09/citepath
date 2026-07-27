# Edge Cases

| ID | Case | Expected behavior | Confidence |
|----|------|-------------------|------------|
| EC01 | Zero drafts | Amber setup banner; checklist campaign/subs/scan/threshold | CONFIRMED |
| EC02 | Queued for days | Karma min, cooldown, extension offline, daily cap | CONFIRMED |
| EC03 | Extension logged out | Re-auth via `/extension-auth-callback` | CONFIRMED |
| EC04 | Manual Reddit posts | Don't update CitePath cap/log; risk during warmup | CONFIRMED |
| EC05 | Quota empty days | Cap resets midnight UTC; per-advocate | CONFIRMED |
| EC06 | Date range BM/AIV wrong | Filter by detection date not post date | CONFIRMED |
| EC07 | Double approve | Server prevents double publish | CONFIRMED |
| EC08 | Solo→Team change | Impossible; create new org | CONFIRMED |
| EC09 | Member opens Billing | Lockout message | CONFIRMED |
| EC10 | Trial expiry | Scanning pauses | CONFIRMED |
| EC11 | Pricing conflicts | Marketing shows $79/$159/$319 annual; help shows $59/$149/$299; pricing page body also mentions $99/$199/$399 | CONFIRMED conflict — CitePath uses documented Help Center monthly as baseline + annual −20% until owner decides |
| EC12 | Subreddit <50 karma | Allow with caution flag | CONFIRMED |
| EC13 | API key shown once | Copy immediately | CONFIRMED |
