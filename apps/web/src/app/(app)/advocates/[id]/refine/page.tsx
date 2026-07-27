"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Button, PageHeader } from "@/components/ui";

export default function RefineAdvocatePage() {
  const params = useParams<{ id: string }>();
  const [samples, setSamples] = useState<Array<{ original: string; rewrite: string }>>([]);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/v1/drafts?tab=all")
      .then((r) => r.json())
      .then((j) => {
        const drafts = (j.drafts ?? []).slice(0, 5);
        setSamples(
          drafts.map((d: { content: string }) => ({ original: d.content, rewrite: d.content })),
        );
        if (!drafts.length) {
          setSamples(
            Array.from({ length: 5 }).map((_, i) => ({
              original: `Sample draft ${i + 1}: This is a helpful Reddit-style comment about the topic.`,
              rewrite: "",
            })),
          );
        }
      });
  }, []);

  async function submit() {
    const res = await fetch("/api/v1/advocates", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "refine",
        id: params.id,
        rewrites: samples.filter((s) => s.rewrite.trim()),
      }),
    });
    const json = await res.json();
    if (res.ok) setMessage("Voice guidelines updated from your rewrites.");
    else setMessage(json.error?.message ?? "Failed");
  }

  return (
    <div>
      <PageHeader
        title="Refine advocate voice"
        description="Rewrite sample drafts in your own words. We extract tone, vocabulary, and disclosure style."
      />
      <div className="space-y-4">
        {samples.map((s, idx) => (
          <div key={idx} className="surface grid gap-3 p-4 md:grid-cols-2">
            <div>
              <div className="mb-1 text-xs text-muted">Original</div>
              <p className="text-sm">{s.original}</p>
            </div>
            <div>
              <div className="mb-1 text-xs text-muted">Your rewrite</div>
              <textarea
                className="min-h-[120px] w-full rounded-[10px] border border-border bg-muted p-3 text-sm"
                value={s.rewrite}
                onChange={(e) => {
                  const next = [...samples];
                  next[idx] = { ...s, rewrite: e.target.value };
                  setSamples(next);
                }}
              />
            </div>
          </div>
        ))}
      </div>
      {message ? <p className="mt-4 text-sm text-success">{message}</p> : null}
      <Button className="mt-6" onClick={submit}>
        Save voice guidelines
      </Button>
    </div>
  );
}
