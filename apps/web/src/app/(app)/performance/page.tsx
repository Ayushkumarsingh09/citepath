"use client";

import { useEffect, useState } from "react";
import { MetricCard, PageHeader, Button } from "@/components/ui";

export default function PerformancePage() {
  const [data, setData] = useState<{
    totals: { views: number; upvotes: number; score: number; count: number };
    byCampaign: Array<{ name: string; upvotes: number; views: number }>;
  } | null>(null);

  useEffect(() => {
    fetch("/api/v1/analytics")
      .then((r) => r.json())
      .then((j) => {
        if (j.totals) setData(j);
      });
  }, []);

  return (
    <div>
      <PageHeader
        title="Performance"
        description="How published comments are performing. Sync Now asks the extension to refresh metrics."
        actions={<Button variant="secondary">Sync Now</Button>}
      />
      <div className="grid gap-4 sm:grid-cols-4">
        <MetricCard label="Published" value={data?.totals.count ?? 0} />
        <MetricCard label="Views" value={data?.totals.views ?? 0} />
        <MetricCard label="Upvotes" value={data?.totals.upvotes ?? 0} />
        <MetricCard
          label="Avg score"
          value={
            data?.totals.count
              ? (data.totals.score / data.totals.count).toFixed(1)
              : "0"
          }
        />
      </div>
      <div className="mt-8 space-y-2">
        {(data?.byCampaign ?? []).map((c) => (
          <div key={c.name} className="surface px-4 py-3 text-sm">
            {c.name}: {c.views} views · {c.upvotes} upvotes
          </div>
        ))}
      </div>
    </div>
  );
}
