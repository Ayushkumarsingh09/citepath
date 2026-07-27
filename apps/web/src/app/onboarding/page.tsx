"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui";

const STEPS = [
  "Workspace",
  "Campaign",
  "Advocate",
  "Subreddits",
  "Reddit account",
  "Extension",
  "First scan",
  "Approve drafts",
];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [campaignId, setCampaignId] = useState<string | null>(null);
  const [workspaceName, setWorkspaceName] = useState("My workspace");
  const [mode, setMode] = useState("SOLO");
  const [campaignName, setCampaignName] = useState("");
  const [productUrl, setProductUrl] = useState("");
  const [advocateName, setAdvocateName] = useState("");
  const [subreddit, setSubreddit] = useState("saas");
  const [redditUser, setRedditUser] = useState("");

  async function next() {
    setError(null);
    try {
      if (step === 0) {
        const res = await fetch("/api/v1/onboarding", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ step: "workspace_mode", mode, name: workspaceName }),
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error?.message);
      }
      if (step === 1) {
        const res = await fetch("/api/v1/onboarding", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            step: "campaign",
            name: campaignName,
            productUrl,
            productName: campaignName,
          }),
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error?.message);
        setCampaignId(json.campaign.id);

        // also via campaigns API path already created
      }
      if (step === 2 && campaignId) {
        const res = await fetch("/api/v1/advocates", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ campaignId, name: advocateName || "Primary advocate" }),
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error?.message);
      }
      if (step === 3 && campaignId) {
        const res = await fetch("/api/v1/subreddits", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: subreddit, campaignId }),
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error?.message);
      }
      if (step === 4) {
        const res = await fetch("/api/v1/reddit-accounts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username: redditUser }),
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error?.message);
      }
      if (step === 6) {
        await fetch("/api/v1/scans", { method: "POST" });
      }
      if (step === 7) {
        await fetch("/api/v1/onboarding", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ step: "complete" }),
        });
        router.push("/dashboard");
        return;
      }
      setStep((s) => s + 1);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed");
    }
  }

  return (
    <div className="mesh-bg flex min-h-screen items-center justify-center px-4 py-10">
      <div className="surface w-full max-w-xl p-8">
        <div className="font-display text-2xl">CitePath setup</div>
        <p className="mt-1 text-sm text-muted">
          Step {step + 1} of 8 — {STEPS[step]}
        </p>
        <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-muted">
          <div className="h-full bg-accent transition-all" style={{ width: `${((step + 1) / 8) * 100}%` }} />
        </div>

        <div className="mt-8 space-y-4">
          {step === 0 && (
            <>
              <input
                className="w-full rounded-[10px] border border-border bg-muted px-3 py-2"
                value={workspaceName}
                onChange={(e) => setWorkspaceName(e.target.value)}
              />
              <select
                className="w-full rounded-[10px] border border-border bg-muted px-3 py-2"
                value={mode}
                onChange={(e) => setMode(e.target.value)}
              >
                <option value="SOLO">Solo</option>
                <option value="TEAM">Team</option>
              </select>
              <p className="text-xs text-warning">Workspace mode cannot be changed later.</p>
            </>
          )}
          {step === 1 && (
            <>
              <input
                placeholder="Campaign / product name"
                className="w-full rounded-[10px] border border-border bg-muted px-3 py-2"
                value={campaignName}
                onChange={(e) => setCampaignName(e.target.value)}
              />
              <input
                placeholder="Product URL"
                className="w-full rounded-[10px] border border-border bg-muted px-3 py-2"
                value={productUrl}
                onChange={(e) => setProductUrl(e.target.value)}
              />
            </>
          )}
          {step === 2 && (
            <input
              placeholder="Advocate persona name"
              className="w-full rounded-[10px] border border-border bg-muted px-3 py-2"
              value={advocateName}
              onChange={(e) => setAdvocateName(e.target.value)}
            />
          )}
          {step === 3 && (
            <input
              placeholder="Subreddit (e.g. saas)"
              className="w-full rounded-[10px] border border-border bg-muted px-3 py-2"
              value={subreddit}
              onChange={(e) => setSubreddit(e.target.value)}
            />
          )}
          {step === 4 && (
            <input
              placeholder="Reddit username (no password)"
              className="w-full rounded-[10px] border border-border bg-muted px-3 py-2"
              value={redditUser}
              onChange={(e) => setRedditUser(e.target.value)}
            />
          )}
          {step === 5 && (
            <div className="text-sm text-muted">
              Install the CitePath Chrome extension from the <code className="text-accent">/extension</code> folder
              (developer mode), then open{" "}
              <a className="text-accent underline" href="/extension-auth-callback">
                /extension-auth-callback
              </a>{" "}
              while logged in to link your session.
            </div>
          )}
          {step === 6 && (
            <p className="text-sm text-muted">We&apos;ll run your first scan now. Drafts appear on the Drafts page.</p>
          )}
          {step === 7 && (
            <p className="text-sm text-muted">
              Approve drafts via the extension queue, or use Copy & Open for manual posting.
            </p>
          )}
        </div>

        {error ? <p className="mt-4 text-sm text-danger">{error}</p> : null}
        <div className="mt-8 flex justify-between">
          <Button variant="ghost" disabled={step === 0} onClick={() => setStep((s) => s - 1)}>
            Back
          </Button>
          <Button onClick={next}>{step === 7 ? "Go to dashboard" : "Continue"}</Button>
        </div>
      </div>
    </div>
  );
}
