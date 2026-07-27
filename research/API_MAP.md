# API Map

## Reference Agent API (CONFIRMED — docs)

Base: `https://api.reddgrow.ai`  
Auth: `x-api-key: rg_...`  
Credits headers: `X-Credits-Used`, `X-Credits-Remaining`, `X-Credits-Limit`

### Documented endpoints

| Method | Pattern | Purpose | Credits (guide) |
|--------|---------|---------|-----------------|
| GET | `/agent/me` | Auth + balance | 1? |
| GET | `/agent/subreddits/search` | Search subs | 3 |
| GET | `/agent/subreddits/{name}/rules` | Rules | 1 |
| GET | `/agent/subreddits/{name}/posts` | Feed | 2 |
| GET | `/agent/posts/search` | Search posts | 3 |
| GET | `/agent/subreddits/{name}/check-url` | URL posted? | 1 |
| GET | `/agent/domains/{domain}/mentions` | Domain mentions | list/search |
| GET | `/agent/users/{username}` | User lookup | 1 |

Changelog: **19 endpoints** across Meta, Subreddits, Posts, Users, Domains. Full list partially UNKNOWN without interactive playground access.

CLI implies additional: wiki, widgets, traffic, comments, duplicates, batch, user posts/comments.

Credit bands: Lookup 1 · List 2 · Search 3 · Heavy/batch 5

## CitePath independent app API (`/api/v1`)

| Namespace | Purpose |
|-----------|---------|
| `/api/v1/auth` | register, login, logout, session, password reset |
| `/api/v1/users` | profile |
| `/api/v1/workspaces` | org CRUD, members, invites |
| `/api/v1/campaigns` | campaigns + KB |
| `/api/v1/advocates` | personas + refine |
| `/api/v1/reddit-accounts` | username connect + metrics |
| `/api/v1/subreddits` | watchlist, discover, import |
| `/api/v1/opportunities` | scored posts |
| `/api/v1/drafts` | generate/approve/archive/copy-open |
| `/api/v1/publishing` | queue for extension |
| `/api/v1/scans` | scan history + trigger |
| `/api/v1/mentions` | brand monitor |
| `/api/v1/competitors` | competitor brands |
| `/api/v1/visibility` | prompts, runs, snapshots |
| `/api/v1/analytics` | performance aggregates |
| `/api/v1/knowledge` | documents ingest |
| `/api/v1/integrations` | slack |
| `/api/v1/notifications` | prefs + inbox |
| `/api/v1/billing` | checkout, portal, webhooks |
| `/api/v1/extension` | queue poll, activity report, metrics sync |
| `/agent/*` | public Agent API (parity surface; prefix `cp_`) |

Error shape:

```json
{ "error": { "code": "string", "message": "string", "details": {} } }
```
