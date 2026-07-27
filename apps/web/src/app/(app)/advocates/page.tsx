"use client";

import { useEffect, useState } from "react";
import { Button, EmptyState, PageHeader } from "@/components/ui";

export default function AdvocatesPage() {
  const [advocates, setAdvocates] = useState<
    Array<{
      id: string;
      name: string;
      role: string;
      tone: string;
      creativity: number;
      campaign: { id: string; name: string };
      redditAccount: { username: string } | null;
    }>
  >([]);
  const [campaigns, setCampaigns] = useState<Array<{ id: string; name: string }>>([]);
  const [accounts, setAccounts] = useState<Array<{ id: string; username: string }>>([]);
  const [form, setForm] = useState({
    campaignId: "",
    name: "",
    role: "Regular User",
    tone: "helpful",
    creativity: 0.5,
    redditAccountId: "",
  });
  const [error, setError] = useState<string | null>(null);

  async function load() {
    const [a, c, r] = await Promise.all([
      fetch("/api/v1/advocates"),
      fetch("/api/v1/campaigns"),
      fetch("/api/v1/reddit-accounts"),
    ]);
    const aj = await a.json();
    const cj = await c.json();
    const rj = await r.json();
    if (a.ok) setAdvocates(aj.advocates);
    if (c.ok) {
      setCampaigns(cj.campaigns);
      if (!form.campaignId && cj.campaigns[0]) setForm((f) => ({ ...f, campaignId: cj.campaigns[0].id }));
    }
    if (r.ok) setAccounts(rj.accounts);
  }

  useEffect(() => {
    load();
  }, []);

  async function create(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const res = await fetch("/api/v1/advocates", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        redditAccountId: form.redditAccountId || undefined,
      }),
    });
    const json = await res.json();
    if (!res.ok) {
      setError(json.error?.message ?? "Failed");
      return;
    }
    setForm((f) => ({ ...f, name: "" }));
    await load();
  }

  return (
    <div>
      <PageHeader title="Advocates" description="AI personas that write your comments. Hierarchy: Campaign → Advocate → Reddit Account." />
      <form onSubmit={create} className="surface mb-8 grid gap-3 p-5 md:grid-cols-2">
        <input
          required
          placeholder="Advocate name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="rounded-[10px] border border-border bg-muted px-3 py-2"
        />
        <select
          value={form.campaignId}
          onChange={(e) => setForm({ ...form, campaignId: e.target.value })}
          className="rounded-[10px] border border-border bg-muted px-3 py-2"
        >
          {campaigns.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <select
          value={form.role}
          onChange={(e) => setForm({ ...form, role: e.target.value })}
          className="rounded-[10px] border border-border bg-muted px-3 py-2"
        >
          <option>Regular User</option>
          <option>Employee</option>
        </select>
        <input
          value={form.tone}
          onChange={(e) => setForm({ ...form, tone: e.target.value })}
          placeholder="Tone"
          className="rounded-[10px] border border-border bg-muted px-3 py-2"
        />
        <label className="text-sm text-muted md:col-span-2">
          Creativity {form.creativity.toFixed(2)}
          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={form.creativity}
            onChange={(e) => setForm({ ...form, creativity: Number(e.target.value) })}
            className="mt-2 w-full"
          />
        </label>
        <select
          value={form.redditAccountId}
          onChange={(e) => setForm({ ...form, redditAccountId: e.target.value })}
          className="rounded-[10px] border border-border bg-muted px-3 py-2 md:col-span-2"
        >
          <option value="">No Reddit account yet</option>
          {accounts.map((a) => (
            <option key={a.id} value={a.id}>
              u/{a.username}
            </option>
          ))}
        </select>
        <Button type="submit" className="md:col-span-2">
          Create advocate
        </Button>
      </form>
      {error ? <p className="mb-4 text-sm text-danger">{error}</p> : null}
      <div className="grid gap-3 sm:grid-cols-2">
        {advocates.map((a) => (
          <div key={a.id} className="surface p-5">
            <h3 className="font-display text-lg">{a.name}</h3>
            <p className="mt-1 text-sm text-muted">
              {a.role} · {a.tone} · creativity {a.creativity}
            </p>
            <p className="mt-1 text-sm text-muted">
              {a.campaign.name}
              {a.redditAccount ? ` · u/${a.redditAccount.username}` : ""}
            </p>
            <Button href={`/advocates/${a.id}/refine`} variant="secondary" className="mt-3">
              Refine voice
            </Button>
          </div>
        ))}
      </div>
      {!advocates.length ? <EmptyState title="No advocates" description="Create a persona after your first campaign." /> : null}
    </div>
  );
}
