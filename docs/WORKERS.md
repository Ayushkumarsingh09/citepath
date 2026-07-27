# Workers

BullMQ queue `citepath-scans` in `apps/worker`.

Redis URL: `REDIS_URL`

Job types planned: reddit.scan, opportunity.score, draft.generate, knowledge.ingest, mention.monitor, visibility.run, analytics.aggregate, notification.deliver

MVP scan execution currently also callable synchronously from `POST /api/v1/scans` for reliable local demos without worker dependency.
