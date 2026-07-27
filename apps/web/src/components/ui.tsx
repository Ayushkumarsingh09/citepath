import Link from "next/link";
import { clsx } from "clsx";

export function Button({
  children,
  href,
  variant = "primary",
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  href?: string;
  variant?: "primary" | "secondary" | "ghost" | "danger";
}) {
  const styles = clsx(
    "inline-flex items-center justify-center gap-2 rounded-[10px] px-4 py-2.5 text-sm font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:opacity-50",
    variant === "primary" && "bg-accent text-white hover:bg-accent-hover",
    variant === "secondary" && "border border-border bg-muted text-foreground hover:bg-elevated",
    variant === "ghost" && "text-muted hover:text-foreground hover:bg-muted",
    variant === "danger" && "bg-danger text-white",
    className,
  );
  if (href) {
    return (
      <Link href={href} className={styles}>
        {children}
      </Link>
    );
  }
  return (
    <button className={styles} {...props}>
      {children}
    </button>
  );
}

export function PageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="font-display text-3xl tracking-tight text-foreground">{title}</h1>
        {description ? <p className="mt-1 text-sm text-muted">{description}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
    </div>
  );
}

export function MetricCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string | number;
  hint?: string;
}) {
  return (
    <div className="surface p-5">
      <div className="text-xs uppercase tracking-wide text-muted">{label}</div>
      <div className="mt-2 font-display text-3xl">{value}</div>
      {hint ? <div className="mt-1 text-xs text-muted">{hint}</div> : null}
    </div>
  );
}

export function EmptyState({ title, description, action }: { title: string; description: string; action?: React.ReactNode }) {
  return (
    <div className="surface flex flex-col items-center justify-center gap-3 px-6 py-16 text-center">
      <h3 className="font-display text-xl">{title}</h3>
      <p className="max-w-md text-sm text-muted">{description}</p>
      {action}
    </div>
  );
}

export function Badge({
  children,
  tone = "default",
}: {
  children: React.ReactNode;
  tone?: "default" | "success" | "warning" | "promo" | "warmup";
}) {
  return (
    <span
      className={clsx(
        "inline-flex rounded-md px-2 py-0.5 text-xs font-medium",
        tone === "default" && "bg-muted text-muted",
        tone === "success" && "bg-success/20 text-success",
        tone === "warning" && "bg-warning/20 text-warning",
        tone === "promo" && "bg-sky-500/20 text-sky-300",
        tone === "warmup" && "bg-orange-500/20 text-orange-300",
      )}
    >
      {children}
    </span>
  );
}

export function WarningBanner({ items }: { items: string[] }) {
  if (!items.length) return null;
  return (
    <div className="mb-6 rounded-[14px] border border-warning/40 bg-warning/10 px-4 py-3 text-sm text-warning">
      <div className="font-medium">Setup needed</div>
      <ul className="mt-1 list-disc pl-5">
        {items.map((i) => (
          <li key={i}>{i}</li>
        ))}
      </ul>
    </div>
  );
}
