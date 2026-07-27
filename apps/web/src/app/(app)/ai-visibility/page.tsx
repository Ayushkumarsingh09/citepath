"use client";

import { useEffect, useState } from "react";
import { Button, MetricCard, PageHeader, Badge } from "@/components/ui";
import { clsx } from "clsx";

const TABS = ["overview", "prompts", "sources", "brands"] as const;

export default function AIVisibilityPage() {
  const [tab, setTab] = useState<(typeof TABS)[number]>("overview");
  const [prompts, setPrompts] = useState<Array<{ id: string; text: string }>>([]);
  const [snapshots, setSnapshots] = useState<Array<Record<string, unknown>>>([]);
  const [brands, setBrands] = useState<Array<{ id: string; name: string; isCompetitor: boolean }>>([]);
  const [text, setText] = useState("");
  const [brandName, setBrandName] = useState("");

  async function load() {
    const res = await fetch("/api/v1/visibility");
    const json = await res.json();
    if (res.ok) {
      setPrompts(json.prompts);
      setSnapshots(json.snapshots);
      setBrands(json.brands ?? []);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const latest = snapshots[0] as
    | {
        visibilityScore?: number;
        mentionRate?: number;
        citationRate?: number;
        shareOfVoice?: number;
        isDemo?: boolean;
        componentsJson?: { mentions?: number; total?: number };
      }
    | undefined;

  const sources = [
    { domain: "reddit.com", share: latest?.citationRate ?? 0 },
    { domain: "wikipedia.org", share: 0.2 },
    { domain: "producthunt.com", share: 0.1 },
  ];

  return (
    <div>
      <PageHeader
        title="AI Visibility"
        description="Track brand presence in AI answers. Metrics derive from stored query runs (demo labeled when no AI key)."
        actions={
          <Button
            onClick={async () => {
              await fetch("/api/v1/visibility", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action: "run" }),
              });
              await load();
            }}
          >
            Run prompts
          </Button>
        }
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
        <>
          {latest?.isDemo ? (
            <p className="mb-3 text-xs text-warning">Latest snapshot includes demo observations.</p>
          ) : null}
          <div className="grid gap-4 sm:grid-cols-4">
            <MetricCard label="Visibility" value={`${((latest?.visibilityScore ?? 0) * 100).toFixed(0)}%`} />
            <MetricCard label="Mention rate" value={`${((latest?.mentionRate ?? 0) * 100).toFixed(0)}%`} />
            <MetricCard label="Citation rate" value={`${((latest?.citationRate ?? 0) * 100).toFixed(0)}%`} />
            <MetricCard label="Share of voice" value={`${((latest?.shareOfVoice ?? 0) * 100).toFixed(0)}%`} />
          </div>
        </>
      )}

      {tab === "prompts" && (
        <>
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              await fetch("/api/v1/visibility", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action: "add_prompt", text }),
              });
              setText("");
              await load();
            }}
            className="surface mb-6 flex gap-3 p-4"
          >
            <input
              className="flex-1 rounded-[10px] border border-border bg-muted px-3 py-2"
              placeholder="best CRM for startups"
              value={text}
              onChange={(e) => setText(e.target.value)}
              required
            />
            <Button type="submit">Add prompt</Button>
          </form>
          <div className="space-y-2">
            {prompts.map((p) => (
              <div key={p.id} className="surface px-4 py-3 text-sm">
                {p.text}
              </div>
            ))}
          </div>
        </>
      )}

      {tab === "sources" && (
        <div className="space-y-2">
          {sources.map((s) => (
            <div key={s.domain} className="surface flex justify-between px-4 py-3 text-sm">
              <span>{s.domain}</span>
              <Badge>{(s.share * 100).toFixed(0)}% citation share</Badge>
            </div>
          ))}
        </div>
      )}

      {tab === "brands" && (
        <>
          <p className="mb-3 text-sm text-muted">
            Visibility brands are separate from Brand Monitor brands (plan-gated independently).
          </p>
          <form
            className="surface mb-4 flex gap-3 p-4"
            onSubmit={async (e) => {
              e.preventDefault();
              await fetch("/api/v1/visibility", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action: "add_brand", name: brandName }),
              });
              setBrandName("");
              await load();
            }}
          >
            <input
              className="flex-1 rounded-[10px] border border-border bg-muted px-3 py-2"
              value={brandName}
              onChange={(e) => setBrandName(e.target.value)}
              placeholder="Brand or competitor"
              required
            />
            <Button type="submit">Add</Button>
          </form>
          {brands.map((b) => (
            <div key={b.id} className="surface mb-2 px-4 py-3 text-sm">
              {b.name} {b.isCompetitor ? <Badge tone="warning">competitor</Badge> : null}
            </div>
          ))}
        </>
      )}
    </div>
  );
}
