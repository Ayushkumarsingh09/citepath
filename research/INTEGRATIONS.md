# Integrations

| Integration | Purpose | Auth | Plan gate | Confidence |
|-------------|---------|------|-----------|------------|
| Chrome Extension | Post, sync metrics, karma | App session bridge `/extension-auth-callback` | All | CONFIRMED |
| Reddit public data | Subreddit/post/user lookup | Reddit public JSON / official API where authorized | All | HIGH — independent adapter |
| Stripe | Subscriptions, add-ons, portal | Stripe keys + webhooks | Billing | CONFIRMED |
| Slack | Daily digest 09:00 UTC | OAuth | Growth+ | CONFIRMED |
| AI LLM provider | Draft generation, refine, scoring | API key | All | HIGH — OpenAI/Anthropic configurable |
| Email | Drafts ready, digests, invites | Provider (Resend/SMTP) | All | HIGH |
| Object storage | KB uploads | S3-compatible | All | HIGH |
| MCP Server | Agent manage campaigns/drafts | API key | Docs | CONFIRMED (exists); depth UNKNOWN |
| CLI `@reddgrow/cli` | Agent API | rg_ key | Docs | CONFIRMED — we ship `@citepath/cli` |

## Out of scope / refused

- Stealing Reddit cookies from other users
- CAPTCHA bypass
- Anti-detection / stealth automation
- Circumventing Reddit ToS anti-abuse systems
