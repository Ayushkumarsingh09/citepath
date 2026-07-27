"use client";

import { useEffect, useState } from "react";
import { Button, PageHeader } from "@/components/ui";
import { clsx } from "clsx";

const TABS = [
  "general",
  "scan-history",
  "activity",
  "notifications",
  "account",
  "billing",
  "organization",
  "api-keys",
  "integrations",
] as const;

export default function SettingsPage() {
  const [tab, setTab] = useState<(typeof TABS)[number]>("general");
  const [data, setData] = useState<Record<string, unknown> | null>(null);
  const [runs, setRuns] = useState<Array<Record<string, unknown>>>([]);
  const [keys, setKeys] = useState<Array<Record<string, unknown>>>([]);
  const [activity, setActivity] = useState<Array<Record<string, unknown>>>([]);
  const [billing, setBilling] = useState<Record<string, unknown> | null>(null);
  const [invites, setInvites] = useState<Array<Record<string, unknown>>>([]);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteToken, setInviteToken] = useState<string | null>(null);
  const [newKey, setNewKey] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [notifs, setNotifs] = useState<Array<Record<string, unknown>>>([]);

  async function load() {
    const res = await fetch("/api/v1/settings");
    const json = await res.json();
    if (res.ok) setData(json);
    const scans = await fetch("/api/v1/scans").then((r) => r.json());
    setRuns(scans.runs ?? []);
    const k = await fetch("/api/v1/api-keys").then((r) => r.json());
    setKeys(k.keys ?? []);
    const act = await fetch("/api/v1/activity").then((r) => r.json());
    setActivity(act.activity ?? []);
    const n = await fetch("/api/v1/notifications").then((r) => r.json());
    setNotifs(n.notifications ?? []);
    const role = json.membership?.role;
    if (role === "OWNER" || role === "ADMIN") {
      const b = await fetch("/api/v1/billing");
      if (b.ok) setBilling(await b.json());
      const inv = await fetch("/api/v1/invitations");
      if (inv.ok) setInvites((await inv.json()).invitations ?? []);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function savePreset(preset: "strict" | "balanced" | "lenient") {
    await fetch("/api/v1/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ relevancePreset: preset }),
    });
    setMessage(`Relevance set to ${preset}`);
    await load();
  }

  const settings = data?.settings as { relevanceThreshold?: number } | null;
  const role = (data?.membership as { role?: string } | undefined)?.role;
  const usage = billing?.usage as Record<string, { used: number; limit: number }> | undefined;

  return (
    <div>
      <PageHeader title="Settings" description="Nine settings areas matching the product contract." />
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
            {t.replace("-", " ")}
          </button>
        ))}
      </div>
      {message ? <p className="mb-4 text-sm text-success">{message}</p> : null}

      {tab === "general" && (
        <div className="surface space-y-4 p-5">
          <p className="text-sm text-muted">
            AI Relevance Threshold (current {((settings?.relevanceThreshold ?? 0.5) * 100).toFixed(0)}%)
          </p>
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" onClick={() => savePreset("strict")}>
              Strict 70%
            </Button>
            <Button onClick={() => savePreset("balanced")}>Balanced 50%</Button>
            <Button variant="secondary" onClick={() => savePreset("lenient")}>
              Lenient 45%
            </Button>
          </div>
        </div>
      )}

      {tab === "scan-history" && (
        <div className="space-y-2">
          {runs.slice(0, 10).map((r) => (
            <div key={String(r.id)} className="surface px-4 py-3 text-sm">
              {String(r.status)} · posts {String(r.postsFound)} · drafts {String(r.draftsGenerated)} ·{" "}
              {new Date(String(r.createdAt)).toLocaleString()}
            </div>
          ))}
        </div>
      )}

      {tab === "activity" && (
        <div className="space-y-2">
          {activity.map((a) => (
            <div key={String(a.id)} className="surface px-4 py-3 text-sm">
              {String(a.type)} · {(a.user as { email?: string })?.email} ·{" "}
              {new Date(String(a.createdAt)).toLocaleString()}
            </div>
          ))}
          {!activity.length ? <p className="text-sm text-muted">No extension activity yet.</p> : null}
        </div>
      )}

      {tab === "notifications" && (
        <div className="space-y-3">
          <Button
            variant="secondary"
            onClick={async () => {
              await fetch("/api/v1/notifications", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ markAll: true }),
              });
              await load();
            }}
          >
            Mark all read
          </Button>
          {notifs.map((n) => (
            <div key={String(n.id)} className="surface px-4 py-3 text-sm">
              <div className="font-medium">{String(n.title)}</div>
              <div className="text-muted">{String(n.body)}</div>
            </div>
          ))}
        </div>
      )}

      {tab === "account" && (
        <div className="surface p-5 text-sm">
          <p>{(data?.user as { name?: string })?.name}</p>
          <p className="text-muted">{(data?.user as { email?: string })?.email}</p>
          <Button
            className="mt-4"
            variant="secondary"
            onClick={async () => {
              await fetch("/api/v1/auth", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action: "logout" }),
              });
              window.location.href = "/login";
            }}
          >
            Log out
          </Button>
        </div>
      )}

      {tab === "billing" && (
        <div className="space-y-4">
          {role === "MEMBER" ? (
            <p className="text-warning">Only owners and admins can manage billing.</p>
          ) : (
            <>
              <div className="surface p-5 text-sm">
                <p>
                  Plan:{" "}
                  <strong>{(billing?.entitlements as { plan?: string })?.plan}</strong> ·{" "}
                  {(billing?.entitlements as { status?: string })?.status}
                </p>
                <div className="mt-4 grid gap-2 sm:grid-cols-2">
                  {usage &&
                    Object.entries(usage).map(([k, v]) => (
                      <div key={k} className="rounded-md bg-muted px-3 py-2">
                        <div className="text-xs uppercase text-muted">{k}</div>
                        <div>
                          {v.used}/{v.limit}
                        </div>
                        <div className="mt-1 h-1.5 overflow-hidden rounded bg-border">
                          <div
                            className="h-full bg-accent"
                            style={{ width: `${Math.min(100, (v.used / Math.max(1, v.limit)) * 100)}%` }}
                          />
                        </div>
                      </div>
                    ))}
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {(["STARTER", "GROWTH", "PRO"] as const).map((plan) => (
                  <Button
                    key={plan}
                    variant="secondary"
                    onClick={async () => {
                      const res = await fetch("/api/v1/billing", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ action: "checkout", plan, interval: "yearly" }),
                      });
                      const json = await res.json();
                      setMessage(json.demo ? `Upgraded to ${plan} (demo checkout)` : json.message);
                      await load();
                    }}
                  >
                    Upgrade {plan}
                  </Button>
                ))}
              </div>
              <div className="flex flex-wrap gap-2">
                {(
                  [
                    ["draftBundle", "Draft Bundle +5/day"],
                    ["campaign", "Extra Campaign"],
                    ["monitorDomain", "Monitor Domain"],
                    ["visibilityPrompts", "+100 Prompts"],
                  ] as const
                ).map(([type, label]) => (
                  <Button
                    key={type}
                    variant="ghost"
                    onClick={async () => {
                      await fetch("/api/v1/billing", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ action: "addon", type, qty: 1 }),
                      });
                      setMessage(`Added ${label}`);
                      await load();
                    }}
                  >
                    Add-on: {label}
                  </Button>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {tab === "organization" && (
        <div className="space-y-4">
          <div className="surface p-5 text-sm">
            <p>
              {(data?.workspace as { name?: string; mode?: string })?.name} · mode{" "}
              {(data?.workspace as { mode?: string })?.mode}
            </p>
            <ul className="mt-3 space-y-1">
              {((data?.members as Array<{ role: string; user: { email: string; name: string } }>) ?? []).map(
                (m) => (
                  <li key={m.user.email}>
                    {m.user.name} ({m.user.email}) — {m.role}
                  </li>
                ),
              )}
            </ul>
          </div>
          {(role === "OWNER" || role === "ADMIN") && (
            <form
              className="surface flex flex-wrap gap-3 p-4"
              onSubmit={async (e) => {
                e.preventDefault();
                const res = await fetch("/api/v1/invitations", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ action: "invite", email: inviteEmail, role: "MEMBER" }),
                });
                const json = await res.json();
                if (res.ok) {
                  setInviteToken(json.acceptToken);
                  setInviteEmail("");
                  await load();
                }
              }}
            >
              <input
                className="rounded-[10px] border border-border bg-muted px-3 py-2"
                placeholder="teammate@company.com"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                required
              />
              <Button type="submit">Invite</Button>
            </form>
          )}
          {inviteToken ? (
            <p className="text-sm text-warning">
              Invite token (dev): <code>{inviteToken}</code>
            </p>
          ) : null}
          {invites.map((i) => (
            <div key={String(i.id)} className="text-sm text-muted">
              Pending: {String(i.email)} ({String(i.role)})
            </div>
          ))}
        </div>
      )}

      {tab === "api-keys" && (
        <div className="space-y-4">
          <Button
            onClick={async () => {
              const res = await fetch("/api/v1/api-keys", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: "Agent key" }),
              });
              const json = await res.json();
              if (res.ok) {
                setNewKey(json.key.secret);
                await load();
              }
            }}
          >
            Create API key
          </Button>
          {newKey ? (
            <div className="surface border-warning/40 p-4 text-sm">
              Copy now — shown once: <code className="text-accent">{newKey}</code>
            </div>
          ) : null}
          {keys.map((k) => (
            <div key={String(k.id)} className="surface flex flex-wrap items-center justify-between gap-2 px-4 py-3 text-sm">
              <div>
                {String(k.name)} · {String(k.keyPrefix)}… · {String(k.creditsUsed)}/{String(k.creditsLimit)}{" "}
                credits
              </div>
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  onClick={async () => {
                    const res = await fetch("/api/v1/api-keys", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ action: "rotate", id: k.id }),
                    });
                    const json = await res.json();
                    if (res.ok) {
                      setNewKey(json.key.secret);
                      setMessage("Key rotated — copy the new secret now");
                      await load();
                    }
                  }}
                >
                  Rotate
                </Button>
                <Button
                  variant="ghost"
                  onClick={async () => {
                    await fetch("/api/v1/api-keys", {
                      method: "DELETE",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ id: k.id }),
                    });
                    await load();
                  }}
                >
                  Revoke
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === "integrations" && (
        <div className="surface p-5 text-sm text-muted">
          Slack daily digest (09:00 UTC) unlocks on Growth+. Connect when Slack OAuth credentials are
          configured (`SLACK_CLIENT_ID` / `SLACK_CLIENT_SECRET`).
        </div>
      )}
    </div>
  );
}
