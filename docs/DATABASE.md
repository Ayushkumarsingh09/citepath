# Database

Prisma schema: `packages/db/prisma/schema.prisma`

- Multi-tenant via `workspaceId`
- Soft deletes on campaigns/advocates/drafts/api keys where appropriate
- Opportunity score components persisted for explainability
- Visibility snapshots store `componentsJson` for reproducible metrics

Commands:

```bash
pnpm db:generate
pnpm db:push
pnpm db:migrate
pnpm db:seed
```
