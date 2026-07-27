"use client";

import { useEffect, useState } from "react";
import { Button, EmptyState, PageHeader } from "@/components/ui";

/** Community management — inferred from marketing (LOW confidence internals). Independent KB-assisted reply queue. */
export default function CommunityPage() {
  const [campaigns, setCampaigns] = useState<Array<{ id: string; name: string }>>([]);
  const [campaignId, setCampaignId] = useState("");
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState<string | null>(null);
  const [chunks, setChunks] = useState<Array<{ content: string; score: number }>>([]);

  useEffect(() => {
    fetch("/api/v1/campaigns")
      .then((r) => r.json())
      .then((j) => {
        setCampaigns(j.campaigns ?? []);
        if (j.campaigns?.[0]) setCampaignId(j.campaigns[0].id);
      });
  }, []);

  async function draftReply(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/v1/knowledge", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "retrieve", campaignId, query: question }),
    });
    const json = await res.json();
    const retrieved = json.chunks ?? [];
    setChunks(retrieved);
    if (!retrieved.length) {
      setAnswer("No knowledge matched. Add docs to this campaign's knowledge base first.");
      return;
    }
    setAnswer(
      `Based on your knowledge base:\n\n${retrieved
        .map((c: { content: string }) => c.content)
        .join("\n\n")
        .slice(0, 1200)}\n\n— CitePath community assist (review before posting)`,
    );
  }

  return (
    <div>
      <PageHeader
        title="Community"
        description="Moderate and answer with your campaign knowledge base. Independent implementation of the community-assist concept."
      />
      <form onSubmit={draftReply} className="surface mb-6 grid gap-3 p-5">
        <select
          className="rounded-[10px] border border-border bg-muted px-3 py-2"
          value={campaignId}
          onChange={(e) => setCampaignId(e.target.value)}
        >
          {campaigns.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <textarea
          className="min-h-[100px] rounded-[10px] border border-border bg-muted px-3 py-2"
          placeholder="Member question or mod queue item"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          required
        />
        <Button type="submit">Draft KB-assisted reply</Button>
      </form>
      {answer ? (
        <div className="surface whitespace-pre-wrap p-5 text-sm">{answer}</div>
      ) : (
        <EmptyState
          title="Ask with context"
          description="Retrieve relevant chunks and draft a reply for human review."
        />
      )}
      {chunks.length ? (
        <div className="mt-4 text-xs text-muted">Matched {chunks.length} chunk(s)</div>
      ) : null}
    </div>
  );
}
