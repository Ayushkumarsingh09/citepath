# API

## App API

Prefix `/api/v1/*` — session cookie auth.

## Agent API

Prefix `/agent/*` — `x-api-key: cp_...`

Implemented: `GET /agent/me`

Remaining endpoints mapped in `research/apis/AGENT_API.md` (parity in progress).

Error shape:

```json
{ "error": { "code": "...", "message": "...", "details": {} } }
```
