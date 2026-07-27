"use client";

import { useEffect, useState } from "react";
import { Badge, Button, EmptyState, PageHeader } from "@/components/ui";

export default function SubredditsPage() {
  const [subs, setSubs] = useState<
    Array<{
      id: string;
      name: string;
      active: boolean;
      campaigns: Array<{ campaign: { id: string; name: string } }>;
    }>
  >([]);
  const [campaigns, setCampaigns] = useState<Array<{ id: string; name: string }>>([]);
  const [name, setName] = useState("");
  const [campaignId, setCampaignId] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function load() {
    const [s, c] = await Promise.all([fetch("/api/v1/subreddits"), fetch("/api/v1/campaigns")]);
    const sj = await s.json();
    const cj = await c.json();
    if (s.ok) setSubs(sj.subreddits);
    if (c.ok) {
      setCampaigns(cj.campaigns);
      if (!campaignId && cj.campaigns[0]) setCampaignId(cj.campaigns[0].id);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const res = await fetch("/api/v1/subreddits", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, campaignId: campaignId || undefined }),
    });
    const json = await res.json();
    if (!res.ok) {
      setError(json.error?.message ?? "Failed");
      return;
    }
    setName("");
    await load();
  }

  async function toggle(id: string, active: boolean) {
    await fetch("/api/v1/subreddits", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, active: !active }),
    });
    await load();
  }

  return (
    <div>
      <PageHeader title="Subreddits" description="Communities the scanner watches. Only active subs produce drafts." />
      <form onSubmit={add} className="surface mb-8 grid gap-3 p-5 md:grid-cols-[1fr_1fr_auto]">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="r/subreddit"
          required
          className="rounded-[10px] border border-border bg-muted px-3 py-2"
        />
        <select
          value={campaignId}
          onChange={(e) => setCampaignId(e.target.value)}
          className="rounded-[10px] border border-border bg-muted px-3 py-2"
        >
          <option value="">No campaign assignment</option>
          {campaigns.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <Button type="submit">Add</Button>
      </form>
      {error ? <p className="mb-4 text-sm text-danger">{error}</p> : null}
      <div className="space-y-2">
        {subs.map((s) => (
          <div key={s.id} className="surface flex flex-wrap items-center justify-between gap-3 px-4 py-3">
            <div>
              <span className="font-medium">r/{s.name}</span>
              <div className="mt-1 flex flex-wrap gap-2">
                <Badge tone={s.active ? "success" : "default"}>{s.active ? "Active" : "Paused"}</Badge>
                {s.campaigns.map((c) => (
                  <Badge key={c.campaign.id}>{c.campaign.name}</Badge>
                ))}
              </div>
            </div>
            <Button variant="secondary" onClick={() => toggle(s.id, s.active)}>
              {s.active ? "Pause" : "Activate"}
            </Button>
          </div>
        ))}
        {!subs.length ? <EmptyState title="No subreddits" description="Add communities or import a CSV later." /> : null}
      </div>
    </div>
  );
}
