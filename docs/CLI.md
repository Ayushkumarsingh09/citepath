# CitePath CLI

```bash
pnpm --filter @citepath/cli start -- auth login cp_...
# or after linking:
citepath auth whoami
citepath r saas about
citepath r saas posts
citepath r search typescript
```

Env:
- `CITEPATH_API_URL` (default http://localhost:3000)
- `CITEPATH_API_KEY` overrides saved key
