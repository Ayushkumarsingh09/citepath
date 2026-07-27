import Link from "next/link";

export default function HelpPage() {
  return (
    <div className="mesh-bg min-h-screen px-6 py-12">
      <div className="mx-auto max-w-3xl">
        <Link href="/" className="font-display text-2xl">
          CitePath
        </Link>
        <h1 className="mt-8 font-display text-4xl">Help</h1>
        <div className="mt-8 space-y-6 text-sm leading-relaxed text-muted">
          <section className="surface p-5">
            <h2 className="font-display text-xl text-foreground">Getting started</h2>
            <ol className="mt-3 list-decimal space-y-2 pl-5">
              <li>Choose Solo or Team (immutable).</li>
              <li>Create a campaign for the product you promote.</li>
              <li>Create an advocate persona.</li>
              <li>Add subreddits and connect a Reddit username.</li>
              <li>Install the extension and link via /extension-auth-callback.</li>
              <li>Scan → review drafts → Approve or Copy & Open.</li>
            </ol>
          </section>
          <section className="surface p-5">
            <h2 className="font-display text-xl text-foreground">Zero drafts?</h2>
            <p className="mt-2">
              Check active campaign, active assigned subreddits, scan history, and relevance threshold
              (Strict/Balanced/Lenient).
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
