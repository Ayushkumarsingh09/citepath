"use client";

import { useEffect, useState } from "react";
import { Badge, Button, EmptyState, MetricCard, PageHeader, WarningBanner } from "@/components/ui";

type Dashboard = {
  pendingDrafts: number;
  recentDrafts: Array<{
    id: string;
    content: string;
    type: string;
    isDemo: boolean;
    campaign: { name: string };
    opportunity?: { post: { title: string; permalink: string; subreddit: string }; finalScore: number };
  }>;
  latestScan: { status: string; draftsGenerated: number; postsFound: number; createdAt: string } | null;
  accounts: Array<{ username: string; karma: number; inWarmup: boolean; promotionalRatio: number }>;
  entitlements: { plan: string; limits: { draftsPerDay: number }; scanningPaused: boolean };
  draftsUsedToday: number;
  setupWarnings: string[];
  demoMode: boolean;
};

export default function DashboardPage() {
  const [data, setData] = useState<Dashboard | null>(null);
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    const res = await fetch("/api/v1/dashboard");
    const json = await res.json();
    if (!res.ok) {
      setError(json.error?.message ?? "Failed to load");
      return;
    }
    setData(json);
  }

  useEffect(() => {
    load();
  }, []);

  async function scanNow() {
    setScanning(true);
    setError(null);
    const res = await fetch("/api/v1/scans", { method: "POST" });
    const json = await res.json();
    setScanning(false);
    if (!res.ok) {
      setError(json.error?.message ?? "Scan failed");
      return;
    }
    await load();
  }

  if (!data && !error) {
    return <div className="text-muted">Loading dashboard…</div>;
  }

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="Your Reddit marketing snapshot"
        actions={
          <Button onClick={scanNow} disabled={scanning || data?.entitlements.scanningPaused}>
            {scanning ? "Scanning…" : "Scan Now"}
          </Button>
        }
      />
      {data?.demoMode ? (
        <div className="mb-4 rounded-[14px] border border-border bg-muted/60 px-4 py-2 text-xs text-muted">
          Demo mode is on — scans may use labeled demo posts when Reddit is unreachable. Set DEMO_MODE=false
          and configure providers for production.
        </div>
      ) : null}
      {error ? <p className="mb-4 text-sm text-danger">{error}</p> : null}
      <WarningBanner items={data?.setupWarnings ?? []} />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard label="Pending drafts" value={data?.pendingDrafts ?? 0} />
        <MetricCard
          label="Drafts today"
          value={`${data?.draftsUsedToday ?? 0}/${data?.entitlements.limits.draftsPerDay ?? 0}`}
        />
        <MetricCard label="Plan" value={data?.entitlements.plan ?? "—"} />
        <MetricCard
          label="Last scan"
          value={data?.latestScan?.status ?? "None"}
          hint={
            data?.latestScan
              ? `${data.latestScan.postsFound} posts · ${data.latestScan.draftsGenerated} drafts`
              : undefined
          }
        />
      </div>

      <h2 className="mb-3 mt-10 font-display text-xl">Warmup</h2>
      <div className="grid gap-3 sm:grid-cols-2">
        {(data?.accounts ?? []).map((a) => (
          <div key={a.username} className="surface p-4">
            <div className="flex items-center gap-2">
              <span className="font-medium">u/{a.username}</span>
              {a.inWarmup ? <Badge tone="warning">Warmup</Badge> : null}
            </div>
            <p className="mt-1 text-sm text-muted">
              {a.karma} karma · {(a.promotionalRatio * 100).toFixed(0)}% promotional ratio
            </p>
          </div>
        ))}
        {!data?.accounts.length ? (
          <EmptyState
            title="No Reddit accounts"
            description="Connect a username (no password) to pace posting safely."
            action={<Button href="/accounts">Connect account</Button>}
          />
        ) : null}
      </div>

      <h2 className="mb-3 mt-10 font-display text-xl">Super-relevant drafts</h2>
      <div className="space-y-3">
        {(data?.recentDrafts ?? []).map((d) => (
          <div key={d.id} className="surface p-4">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <Badge tone={d.type === "PROMOTIONAL" ? "promo" : "warmup"}>{d.type}</Badge>
              {d.isDemo ? <Badge>Demo</Badge> : null}
              <span className="text-xs text-muted">{d.campaign.name}</span>
              {d.opportunity ? (
                <span className="text-xs text-muted">
                  r/{d.opportunity.post.subreddit} · score {(d.opportunity.finalScore * 100).toFixed(0)}%
                </span>
              ) : null}
            </div>
            <p className="text-sm leading-relaxed">{d.content}</p>
          </div>
        ))}
        {!data?.recentDrafts.length ? (
          <EmptyState
            title="No drafts yet"
            description="Run Scan Now after campaigns and subreddits are active."
            action={<Button href="/drafts">Open drafts</Button>}
          />
        ) : null}
      </div>
    </div>
  );
}
