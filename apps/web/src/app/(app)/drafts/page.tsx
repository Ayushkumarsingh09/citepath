"use client";

import { useEffect, useState } from "react";
import { Badge, Button, EmptyState, PageHeader } from "@/components/ui";
import { clsx } from "clsx";

const TABS = [
  { id: "all", label: "All" },
  { id: "waiting", label: "Waiting for Approval" },
  { id: "queue", label: "Posting Queue" },
  { id: "published", label: "Published" },
  { id: "archive", label: "Archive" },
];

type Draft = {
  id: string;
  content: string;
  type: string;
  status: string;
  isDemo: boolean;
  campaign: { name: string };
  opportunity?: { post: { title: string; permalink: string; subreddit: string } };
};

export default function DraftsPage() {
  const [tab, setTab] = useState("waiting");
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [error, setError] = useState<string | null>(null);

  async function load(t = tab) {
    const res = await fetch(`/api/v1/drafts?tab=${t}`);
    const json = await res.json();
    if (!res.ok) {
      setError(json.error?.message ?? "Failed");
      return;
    }
    setDrafts(json.drafts);
  }

  useEffect(() => {
    load(tab);
  }, [tab]);

  async function act(id: string, action: string) {
    const res = await fetch("/api/v1/drafts", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, action }),
    });
    const json = await res.json();
    if (!res.ok) {
      setError(json.error?.message ?? "Action failed");
      return;
    }
    if (action === "copy_open" && json.openUrl) {
      await navigator.clipboard.writeText(json.content);
      window.open(json.openUrl, "_blank");
    }
    await load();
  }

  return (
    <div>
      <PageHeader title="Drafts" description="Review AI-generated comment replies before they publish." />
      {error ? <p className="mb-4 text-sm text-danger">{error}</p> : null}
      <div className="mb-6 flex flex-wrap gap-2">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={clsx(
              "rounded-[10px] px-3 py-1.5 text-sm",
              tab === t.id ? "bg-accent text-white" : "bg-muted text-muted hover:text-foreground",
            )}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div className="space-y-3">
        {drafts.map((d) => (
          <div key={d.id} className="surface p-5">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <Badge tone={d.type === "PROMOTIONAL" ? "promo" : "warmup"}>{d.type}</Badge>
              <Badge>{d.status}</Badge>
              {d.isDemo ? <Badge tone="warning">Demo data</Badge> : null}
              <span className="text-xs text-muted">{d.campaign.name}</span>
              {d.opportunity ? (
                <a
                  href={d.opportunity.post.permalink}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-accent hover:underline"
                >
                  r/{d.opportunity.post.subreddit}: {d.opportunity.post.title.slice(0, 60)}
                </a>
              ) : null}
            </div>
            <p className="whitespace-pre-wrap text-sm leading-relaxed">{d.content}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {d.status === "PENDING" ? (
                <>
                  <Button onClick={() => act(d.id, "approve")}>Approve (extension)</Button>
                  <Button variant="secondary" onClick={() => act(d.id, "copy_open")}>
                    Copy & Open
                  </Button>
                  <Button variant="ghost" onClick={() => act(d.id, "archive")}>
                    Archive
                  </Button>
                </>
              ) : null}
              {d.status === "QUEUED" ? (
                <Button variant="ghost" onClick={() => act(d.id, "archive")}>
                  Archive stuck draft
                </Button>
              ) : null}
            </div>
          </div>
        ))}
        {!drafts.length ? (
          <EmptyState
            title="No drafts in this tab"
            description="Activate a campaign, assign subreddits, then run Scan Now from the dashboard."
          />
        ) : null}
      </div>
    </div>
  );
}
