"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";
import {
  LayoutDashboard,
  FileText,
  Megaphone,
  Users,
  UserCircle2,
  Hash,
  Radar,
  Sparkles,
  Settings,
  Activity,
  Route,
  Menu,
  X,
  MessagesSquare,
} from "lucide-react";
import { useEffect, useState } from "react";

const NAV = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/performance", label: "Performance", icon: Activity },
  { href: "/journey", label: "Journey", icon: Route },
  { href: "/drafts", label: "Drafts", icon: FileText },
  { href: "/campaigns", label: "Campaigns", icon: Megaphone },
  { href: "/advocates", label: "Advocates", icon: Users },
  { href: "/accounts", label: "Accounts", icon: UserCircle2 },
  { href: "/subreddits", label: "Subreddits", icon: Hash },
  { href: "/brand-monitor", label: "Brand Monitor", icon: Radar },
  { href: "/ai-visibility", label: "AI Visibility", icon: Sparkles },
  { href: "/community", label: "Community", icon: MessagesSquare },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function AppShell({
  children,
  workspaceName,
}: {
  children: React.ReactNode;
  workspaceName?: string;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [trialBanner, setTrialBanner] = useState<string | null>(null);
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    fetch("/api/v1/settings")
      .then((r) => r.json())
      .then((j) => {
        const ends = j.entitlements?.subscription?.trialEndsAt;
        const status = j.entitlements?.status;
        if (status === "TRIALING" && ends) {
          const days = Math.ceil((new Date(ends).getTime() - Date.now()) / 86_400_000);
          if (days <= 3) {
            setTrialBanner(
              `Trial ends in ${Math.max(0, days)} day(s) — choose a plan in Settings → Billing.`,
            );
          }
        }
        if (j.entitlements?.scanningPaused) {
          setTrialBanner("Scanning paused — pick a plan in Settings → Billing.");
        }
      })
      .catch(() => undefined);
    fetch("/api/v1/notifications")
      .then((r) => r.json())
      .then((j) => setUnread(j.unread ?? 0))
      .catch(() => undefined);
  }, []);

  const nav = (
    <nav className="flex flex-col gap-1 p-3">
      {NAV.map((item) => {
        const active = pathname === item.href || pathname.startsWith(item.href + "/");
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setOpen(false)}
            className={clsx(
              "flex items-center gap-3 rounded-[10px] px-3 py-2 text-sm transition",
              active ? "bg-accent/15 text-accent" : "text-muted hover:bg-muted hover:text-foreground",
            )}
          >
            <Icon size={18} />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className="min-h-screen mesh-bg lg:grid lg:grid-cols-[240px_1fr]">
      <aside className="hidden border-r border-border bg-elevated/80 backdrop-blur lg:flex lg:flex-col">
        <div className="border-b border-border px-4 py-5">
          <Link href="/dashboard" className="font-display text-xl tracking-tight">
            CitePath
          </Link>
          <div className="mt-1 truncate text-xs text-muted">{workspaceName ?? "Workspace"}</div>
        </div>
        {nav}
      </aside>

      <div className="min-w-0">
        <header className="sticky top-0 z-20 flex items-center justify-between border-b border-border bg-background/80 px-4 py-3 backdrop-blur lg:hidden">
          <Link href="/dashboard" className="font-display text-lg">
            CitePath
          </Link>
          <button
            type="button"
            aria-label="Menu"
            className="rounded-md p-2 hover:bg-muted"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </header>
        {open ? <div className="border-b border-border bg-elevated lg:hidden">{nav}</div> : null}
        {trialBanner ? (
          <div className="border-b border-warning/40 bg-warning/10 px-4 py-2 text-center text-sm text-warning">
            {trialBanner}{" "}
            <Link href="/settings" className="underline">
              Open billing
            </Link>
          </div>
        ) : null}
        <div className="mx-auto flex max-w-6xl items-center justify-end gap-3 px-4 pt-4 sm:px-6">
          <Link href="/settings" className="text-xs text-muted hover:text-foreground">
            Notifications{unread ? ` (${unread})` : ""}
          </Link>
        </div>
        <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6">{children}</main>
      </div>
    </div>
  );
}
