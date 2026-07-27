# Secrets

## Local

1. Copy `.env.example` → `.env` and `apps/web/.env.local`
2. Never commit real values
3. Use unique `SESSION_SECRET` per environment

## Production

Prefer a secret manager. Map the same keys as `.env.example`.

Checklist:

- [ ] `SESSION_SECRET` ≥ 32 random bytes
- [ ] DB credentials rotated from defaults (`citepath/citepath` is local-only)
- [ ] Stripe webhook endpoint uses `STRIPE_WEBHOOK_SECRET` + replay protection
- [ ] API keys shown once; revoke/rotate via UI
- [ ] `DEMO_MODE=false` in production
- [ ] Restrict `APP_URL` / CORS / cookie `Secure` on HTTPS
