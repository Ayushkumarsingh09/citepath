"use client";

import { useEffect, useState } from "react";
import { Badge, MetricCard, PageHeader } from "@/components/ui";

export default function JourneyPage() {
  const [accounts, setAccounts] = useState<
    Array<{
      username: string;
      karma: number;
      milestone: string;
      promotionalRatio: number;
      inWarmup: boolean;
      accountAgeDays: number;
    }>
  >([]);

  useEffect(() => {
    fetch("/api/v1/reddit-accounts")
      .then((r) => r.json())
      .then((j) => setAccounts(j.accounts ?? []));
  }, []);

  return (
    <div>
      <PageHeader
        title="My Karma Journey"
        description="Milestones: Newcomer → Contributor → Trusted → Established. Promo ratio rises with karma."
      />
      <div className="space-y-4">
        {accounts.map((a) => (
          <div key={a.username} className="surface p-5">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-display text-xl">u/{a.username}</h3>
              <Badge>{a.milestone}</Badge>
              {a.inWarmup ? <Badge tone="warning">Warmup</Badge> : null}
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <MetricCard label="Karma" value={a.karma} />
              <MetricCard label="Promo ratio" value={`${(a.promotionalRatio * 100).toFixed(0)}%`} />
              <MetricCard label="Account age" value={`${a.accountAgeDays}d`} />
            </div>
            <div className="mt-4 h-2 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full bg-accent"
                style={{ width: `${Math.min(100, (a.karma / 500) * 100)}%` }}
              />
            </div>
            <p className="mt-2 text-xs text-muted">Progress toward Established (500+ karma promo cap)</p>
          </div>
        ))}
      </div>
    </div>
  );
}
