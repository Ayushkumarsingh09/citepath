# Agent API — full public endpoint inventory (2026-07-28)

Source: docs.reddgrow.ai via research agent. Confidence: CONFIRMED for paths; schemas partially UNKNOWN.

Base: https://api.reddgrow.ai
Auth: x-api-key: rg_*

## Endpoints (19)

### Meta
- GET /agent/me — 1 credit

### Subreddits
- GET /agent/subreddits/search?q= — 3
- GET /agent/subreddits/{name}/about — 1
- GET /agent/subreddits/{name}/rules — 1
- GET /agent/subreddits/{name}/posts?sort=&t=&limit= — 2
- GET /agent/subreddits/{name}/comments?limit= — 2
- GET /agent/subreddits/{name}/wiki — 5
- GET /agent/subreddits/{name}/wiki/{page} — 5
- GET /agent/subreddits/{name}/widgets — 1
- GET /agent/subreddits/{name}/traffic — 1
- GET /agent/subreddits/{name}/check-url?url= — 3

### Posts
- GET /agent/posts/search?q=&limit= — 3
- GET /agent/posts/batch?ids= — 5
- GET /agent/posts/{subreddit}/{id}/comments — 2
- GET /agent/posts/{subreddit}/{id}/duplicates — 5

### Users
- GET /agent/users/{username} — 1
- GET /agent/users/{username}/posts — 2
- GET /agent/users/{username}/comments — 2

### Domains
- GET /agent/domains/{domain}/mentions?limit= — 5

Headers: X-Credits-Used, X-Credits-Remaining, X-Credits-Limit
Errors: 401, 429, 500

Agent API credit plans (separate from SaaS): Free 50 · Starter 1k · Growth 5k · Pro 15k · Enterprise 100k / month

## Chrome Extension (public store)

- ID: hgpbemhkofmchpkjckocgdfpjiijhpkd
- Version: 1.0.47 (2026-07-27)
- Side panel; human clicks Post; new+old Reddit
- Claims in store: no fully autonomous auto-post (help center describes queued posting when conditions met — note discrepancy)

CitePath implements independent MV3 extension with equivalent workflow; no copying of their extension code.
