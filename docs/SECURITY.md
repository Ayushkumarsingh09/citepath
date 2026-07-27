# Security

- Passwords hashed with bcrypt (cost 12)
- Session tokens stored hashed (SHA-256); httpOnly cookies
- RBAC checked in API (`requireMembership`)
- Entitlements enforced server-side
- No Reddit passwords collected
- Extension does not export cookies; uses browser session only
- Secrets via env only

OWASP-oriented follow-ups: CSRF for cookie mutating routes in production, rate limits on auth, SSRF controls on URL crawl, upload validation for KB files.
