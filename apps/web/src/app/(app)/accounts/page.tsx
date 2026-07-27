"use client";

import { useEffect, useState } from "react";
import { Badge, Button, EmptyState, PageHeader } from "@/components/ui";

export default function AccountsPage() {
  const [accounts, setAccounts] = useState<
    Array<{
      id: string;
      username: string;
      karma: number;
      accountAgeDays: number;
      verifiedEmail: boolean;
      isMod: boolean;
      promotionalRatio: number;
      milestone: string;
      inWarmup: boolean;
    }>
  >([]);
  const [username, setUsername] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [demoNote, setDemoNote] = useState(false);

  async function load() {
    const res = await fetch("/api/v1/reddit-accounts");
    const json = await res.json();
    if (res.ok) setAccounts(json.accounts);
  }

  useEffect(() => {
    load();
  }, []);

  async function connect(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const res = await fetch("/api/v1/reddit-accounts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username }),
    });
    const json = await res.json();
    if (!res.ok) {
      setError(json.error?.message ?? "Failed");
      return;
    }
    setDemoNote(Boolean(json.isDemo));
    setUsername("");
    await load();
  }

  return (
    <div>
      <PageHeader
        title="Accounts"
        description="Connect by username only — no password. The Chrome extension uses your browser Reddit session."
      />
      <form onSubmit={connect} className="surface mb-8 flex flex-wrap gap-3 p-5">
        <input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Reddit username"
          required
          className="min-w-[220px] flex-1 rounded-[10px] border border-border bg-muted px-3 py-2"
        />
        <Button type="submit">Connect</Button>
      </form>
      {demoNote ? (
        <p className="mb-4 text-sm text-warning">Lookup used demo profile fallback (DEMO_MODE or Reddit unavailable).</p>
      ) : null}
      {error ? <p className="mb-4 text-sm text-danger">{error}</p> : null}
      <div className="grid gap-3 sm:grid-cols-2">
        {accounts.map((a) => (
          <div key={a.id} className="surface p-5">
            <div className="flex items-center gap-2">
              <h3 className="font-display text-lg">u/{a.username}</h3>
              {a.inWarmup ? <Badge tone="warning">🔥 Warmup</Badge> : null}
            </div>
            <p className="mt-2 text-sm text-muted">
              {a.karma} karma · {a.accountAgeDays}d old · {a.milestone}
            </p>
            <p className="mt-1 text-sm text-muted">
              Promo ratio {(a.promotionalRatio * 100).toFixed(0)}% ·{" "}
              {a.verifiedEmail ? "verified email" : "unverified"} · {a.isMod ? "mod" : "not mod"}
            </p>
          </div>
        ))}
      </div>
      {!accounts.length ? (
        <EmptyState title="No accounts" description="Enter a public Reddit username to attach metrics." />
      ) : null}
    </div>
  );
}
