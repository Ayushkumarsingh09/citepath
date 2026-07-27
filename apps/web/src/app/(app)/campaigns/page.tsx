"use client";

import { useEffect, useState } from "react";
import { Badge, Button, EmptyState, PageHeader } from "@/components/ui";

type Campaign = {
  id: string;
  name: string;
  productName: string | null;
  active: boolean;
  _count: { advocates: number; drafts: number; subreddits: number };
};

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [name, setName] = useState("");
  const [productUrl, setProductUrl] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function load() {
    const res = await fetch("/api/v1/campaigns");
    const json = await res.json();
    if (res.ok) setCampaigns(json.campaigns);
  }

  useEffect(() => {
    load();
  }, []);

  async function create(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const res = await fetch("/api/v1/campaigns", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, productUrl, productName: name }),
    });
    const json = await res.json();
    if (!res.ok) {
      setError(json.error?.message ?? "Failed");
      return;
    }
    setName("");
    setProductUrl("");
    await load();
  }

  async function toggle(id: string, active: boolean) {
    await fetch("/api/v1/campaigns", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, active: !active }),
    });
    await load();
  }

  return (
    <div>
      <PageHeader title="Campaigns" description="One product, website, or topic you want to promote." />
      <form onSubmit={create} className="surface mb-8 grid gap-3 p-5 sm:grid-cols-[1fr_1fr_auto]">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Campaign name"
          required
          className="rounded-[10px] border border-border bg-muted px-3 py-2"
        />
        <input
          value={productUrl}
          onChange={(e) => setProductUrl(e.target.value)}
          placeholder="Product URL (optional)"
          className="rounded-[10px] border border-border bg-muted px-3 py-2"
        />
        <Button type="submit">Create</Button>
      </form>
      {error ? <p className="mb-4 text-sm text-danger">{error}</p> : null}
      <div className="space-y-3">
        {campaigns.map((c) => (
          <div key={c.id} className="surface flex flex-wrap items-center justify-between gap-3 p-5">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-display text-lg">{c.name}</h3>
                <Badge tone={c.active ? "success" : "default"}>{c.active ? "Active" : "Paused"}</Badge>
              </div>
              <p className="mt-1 text-sm text-muted">
                {c._count.subreddits} subreddits · {c._count.advocates} advocates · {c._count.drafts} drafts
              </p>
            </div>
            <div className="flex gap-2">
              <Button href={`/campaigns/${c.id}`} variant="secondary">
                Open
              </Button>
              <Button variant="secondary" onClick={() => toggle(c.id, c.active)}>
                {c.active ? "Pause" : "Activate"}
              </Button>
            </div>
          </div>
        ))}
        {!campaigns.length ? (
          <EmptyState title="No campaigns" description="Create a campaign to start scanning relevant threads." />
        ) : null}
      </div>
    </div>
  );
}
