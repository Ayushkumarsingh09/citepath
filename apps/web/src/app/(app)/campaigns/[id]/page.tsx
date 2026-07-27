"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Badge, Button, EmptyState, PageHeader } from "@/components/ui";

export default function CampaignDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [campaign, setCampaign] = useState<{
    id: string;
    name: string;
    active: boolean;
    productUrl: string | null;
    description: string | null;
  } | null>(null);
  const [docs, setDocs] = useState<Array<{ id: string; title: string; sourceType: string; chunkCount: number }>>([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [url, setUrl] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function load() {
    const camps = await fetch("/api/v1/campaigns").then((r) => r.json());
    const c = (camps.campaigns ?? []).find((x: { id: string }) => x.id === id);
    setCampaign(c ?? null);
    const res = await fetch(`/api/v1/knowledge?campaignId=${id}`);
    const json = await res.json();
    if (res.ok) setDocs(json.documents);
  }

  useEffect(() => {
    load();
  }, [id]);

  async function uploadText(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const res = await fetch("/api/v1/knowledge", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "upload_text", campaignId: id, title, content, sourceType: "txt" }),
    });
    const json = await res.json();
    if (!res.ok) {
      setError(json.error?.message ?? "Failed");
      return;
    }
    setTitle("");
    setContent("");
    await load();
  }

  async function ingestUrl(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const res = await fetch("/api/v1/knowledge", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "ingest_url", campaignId: id, url }),
    });
    const json = await res.json();
    if (!res.ok) {
      setError(json.error?.message ?? "Failed");
      return;
    }
    setUrl("");
    await load();
  }

  if (!campaign) return <div className="text-muted">Loading campaign…</div>;

  return (
    <div>
      <PageHeader
        title={campaign.name}
        description="Campaign detail · knowledge base · assignments"
        actions={
          <Badge tone={campaign.active ? "success" : "default"}>
            {campaign.active ? "Active" : "Paused"}
          </Badge>
        }
      />
      <div className="surface mb-8 space-y-2 p-5 text-sm">
        <p>
          <span className="text-muted">Product URL:</span> {campaign.productUrl ?? "—"}
        </p>
        <p className="text-muted">{campaign.description ?? "No description"}</p>
      </div>

      <h2 className="mb-3 font-display text-xl">Knowledge base</h2>
      <p className="mb-4 text-sm text-muted">
        Upload TXT/MD content or crawl a public URL (max practical size enforced). Chunks feed draft generation.
      </p>
      {error ? <p className="mb-3 text-sm text-danger">{error}</p> : null}
      <form onSubmit={uploadText} className="surface mb-4 grid gap-3 p-4">
        <input
          className="rounded-[10px] border border-border bg-muted px-3 py-2"
          placeholder="Document title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <textarea
          className="min-h-[120px] rounded-[10px] border border-border bg-muted px-3 py-2"
          placeholder="Paste FAQ / product copy"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
        />
        <Button type="submit">Upload text</Button>
      </form>
      <form onSubmit={ingestUrl} className="surface mb-6 flex flex-wrap gap-3 p-4">
        <input
          className="min-w-[240px] flex-1 rounded-[10px] border border-border bg-muted px-3 py-2"
          placeholder="https://docs.example.com/product"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          required
        />
        <Button type="submit" variant="secondary">
          Crawl URL
        </Button>
      </form>
      <div className="space-y-2">
        {docs.map((d) => (
          <div key={d.id} className="surface flex items-center justify-between px-4 py-3 text-sm">
            <div>
              <div className="font-medium">{d.title}</div>
              <div className="text-xs text-muted">
                {d.sourceType} · {d.chunkCount} chunks
              </div>
            </div>
            <Button
              variant="ghost"
              onClick={async () => {
                await fetch("/api/v1/knowledge", {
                  method: "DELETE",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ id: d.id }),
                });
                await load();
              }}
            >
              Delete
            </Button>
          </div>
        ))}
        {!docs.length ? (
          <EmptyState title="No knowledge yet" description="Add product docs so drafts stay accurate." />
        ) : null}
      </div>
    </div>
  );
}
