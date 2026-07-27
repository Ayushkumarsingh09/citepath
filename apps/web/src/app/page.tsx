import Link from "next/link";
import { Button } from "@/components/ui";

export default function HomePage() {
  return (
    <div className="mesh-bg min-h-screen">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <div className="font-display text-2xl tracking-tight">CitePath</div>
        <div className="flex items-center gap-3">
          <Button href="/login" variant="ghost">
            Log in
          </Button>
          <Button href="/signup">Start free trial</Button>
        </div>
      </header>

      <section className="relative mx-auto max-w-6xl px-6 pb-24 pt-16">
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute left-1/2 top-10 h-[420px] w-[900px] -translate-x-1/2 rounded-full bg-accent/10 blur-3xl" />
        </div>
        <p className="mb-4 text-sm uppercase tracking-[0.2em] text-accent">Get cited by AI</p>
        <h1 className="max-w-3xl font-display text-5xl leading-[1.05] tracking-tight sm:text-6xl">
          CitePath
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-muted">
          Reddit powers AI answers. Find threads models already trust, draft helpful comments, and
          measure your brand in ChatGPT, Claude, Gemini, and Perplexity.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Button href="/signup">Start free trial</Button>
          <Button href="/pricing" variant="secondary">
            View pricing
          </Button>
        </div>
      </section>

      <section className="border-t border-border bg-elevated/40 py-20">
        <div className="mx-auto grid max-w-6xl gap-10 px-6 md:grid-cols-4">
          {[
            ["01 Scan", "Find Reddit posts LLMs already cite for your keywords."],
            ["02 Match", "Filter to brand-relevant threads and competitor angles."],
            ["03 Draft", "Generate on-brand comments that still sound human."],
            ["04 Cited", "Track share of voice as AI answers re-index."],
          ].map(([t, d]) => (
            <div key={t}>
              <h3 className="font-display text-xl">{t}</h3>
              <p className="mt-2 text-sm text-muted">{d}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-20">
        <h2 className="font-display text-3xl">Platform modules</h2>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[
            ["AI Visibility", "See what AI recommends across engines and regions."],
            ["Brand Monitor", "Alerts when your brand or competitors are mentioned."],
            ["AI Drafts", "Helpful comments matched to advocate voice."],
            ["Chrome Extension", "Review and post from your Reddit session."],
            ["Analytics", "Track engagement, reach, and citation growth."],
            ["Karma Journey", "Warm up accounts safely with paced posting."],
          ].map(([t, d]) => (
            <div key={t} className="surface p-5">
              <h3 className="font-display text-lg">{t}</h3>
              <p className="mt-2 text-sm text-muted">{d}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-border px-6 py-10 text-center text-sm text-muted">
        <p>
          CitePath is an independent product. Not affiliated with ReddGrow.{" "}
          <Link href="/help" className="text-accent hover:underline">
            Help
          </Link>
        </p>
      </footer>
    </div>
  );
}
