"use client";

import { useEffect, useState } from "react";
import { Button, MetricCard, PageHeader, Badge } from "@/components/ui";
import { clsx } from "clsx";

const TABS = ["overview", "mentions", "subreddits", "brands"] as const;

export default function BrandMonitorPage() {
  const [tab, setTab] = useState<(typeof TABS)[number]>("overview");
  const [brands, setBrands] = useState<Array<{ id: string; name: string; domain?: string | null; isCompetitor: boolean }>>([]);
  const [mentions, setMentions] = useState<Array<Record<string, unknown>>>([]);
  const [name, setName] = useState("");
  const [domain, setDomain] = useState("");

  async function load() {
    const res = await fetch("/api/v1/mentions");
    const json = await res.json();
    if (res.ok) {
      setBrands(json.brands);
      setMentions(json.mentions);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const bySub = new Map<string, number>();
  for (const m of mentions) {
    const s = String(m.subreddit ?? "unknown");
    bySub.set(s, (bySub.get(s) ?? 0) + 1);
  }

  return (
    <div>
      <PageHeader
        title="Brand Monitor"
        description="Tracks Reddit posts mentioning your brand or competitors. Filter uses detection date."
      />
      <div className="mb-6 flex flex-wrap gap-2">
        {TABS.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={clsx(
              "rounded-[10px] px-3 py-1.5 text-sm capitalize",
              tab === t ? "bg-accent text-white" : "bg-muted text-muted",
            )}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "overview" && (
        <div className="grid gap-4 sm:grid-cols-3">
          <MetricCard label="Brands" value={brands.length} />
          <MetricCard label="Mentions" value={mentions.length} />
          <MetricCard
            label="Sentiment mix"
            value={mentions.filter((m) => m.sentiment === "POSITIVE").length}
            hint="positive detections"
          />
        </div>
      )}

      {tab === "mentions" && (
        <div className="space-y-2">
          {mentions.map((m) => (
            <div key={String(m.id)} className="surface px-4 py-3 text-sm">
              <a className="text-accent hover:underline" href={String(m.url)} target="_blank" rel="noreferrer">
                {String(m.title)}
              </a>
              <div className="text-xs text-muted">
                {String(m.subreddit)} · {String(m.sentiment)} ·{" "}
                {new Date(String(m.detectedAt)).toLocaleString()}
                {m.isDemo ? " · demo" : ""}
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === "subreddits" && (
        <div className="space-y-2">
          {[...bySub.entries()].map(([sub, count]) => (
            <div key={sub} className="surface flex justify-between px-4 py-3 text-sm">
              <span>r/{sub}</span>
              <Badge>{count} mentions</Badge>
            </div>
          ))}
          {!bySub.size ? <p className="text-sm text-muted">No subreddit breakdown yet.</p> : null}
        </div>
      )}

      {tab === "brands" && (
        <>
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              await fetch("/api/v1/mentions", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action: "add_brand", name, domain }),
              });
              setName("");
              setDomain("");
              await load();
            }}
            className="surface mb-6 flex flex-wrap gap-3 p-4"
          >
            <input
              className="rounded-[10px] border border-border bg-muted px-3 py-2"
              placeholder="Brand name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <input
              className="rounded-[10px] border border-border bg-muted px-3 py-2"
              placeholder="domain.com"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
            />
            <Button type="submit">Add brand</Button>
          </form>
          <div className="space-y-2">
            {brands.map((b) => (
              <div key={b.id} className="surface px-4 py-3 text-sm">
                {b.name} {b.domain ? `· ${b.domain}` : ""}{" "}
                {b.isCompetitor ? <Badge tone="warning">competitor</Badge> : null}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
