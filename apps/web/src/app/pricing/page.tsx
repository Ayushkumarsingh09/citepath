import { PLAN_LIMITS } from "@citepath/shared";
import { Button } from "@/components/ui";
import Link from "next/link";

export default function PricingPage() {
  const plans = [
    { key: "STARTER" as const, name: "Starter", blurb: "Get discovered by AI" },
    { key: "GROWTH" as const, name: "Growth", blurb: "Own your niche", popular: true },
    { key: "PRO" as const, name: "Pro", blurb: "Dominate AI search" },
  ];

  return (
    <div className="mesh-bg min-h-screen">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <Link href="/" className="font-display text-2xl">
          CitePath
        </Link>
        <Button href="/signup">Start free trial</Button>
      </header>
      <main className="mx-auto max-w-6xl px-6 py-12">
        <h1 className="font-display text-4xl">Pricing</h1>
        <p className="mt-2 text-muted">14-day free trial. Annual saves ~20%. Baseline from Help Center figures.</p>
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {plans.map((p) => {
            const lim = PLAN_LIMITS[p.key];
            return (
              <div key={p.key} className="surface relative p-6">
                {p.popular ? (
                  <div className="absolute right-4 top-4 text-xs text-accent">Most popular</div>
                ) : null}
                <h2 className="font-display text-2xl">{p.name}</h2>
                <p className="text-sm text-muted">{p.blurb}</p>
                <div className="mt-4 font-display text-4xl">${lim.priceMonthly}</div>
                <div className="text-sm text-muted">/mo · ${(lim.priceMonthly * 0.8).toFixed(0)} annual</div>
                <ul className="mt-6 space-y-2 text-sm text-muted">
                  <li>{lim.redditAccounts >= 999 ? "Unlimited" : lim.redditAccounts} Reddit accounts</li>
                  <li>{lim.campaigns} campaigns</li>
                  <li>{lim.subreddits} subreddits</li>
                  <li>{lim.draftsPerDay} drafts/day</li>
                  <li>{lim.monitorDomains} Brand Monitor domains</li>
                  <li>{lim.visibilityPrompts} AI Visibility prompts</li>
                  <li>Unlimited seats</li>
                  {lim.slack ? <li>Slack integration</li> : <li>Community support</li>}
                </ul>
                <Button href="/signup" className="mt-6 w-full">
                  Start Free Trial
                </Button>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
