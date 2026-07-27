/** Promotional ratio by karma — Help Center CONFIRMED */
export function promotionalRatio(karma: number): number {
  if (karma < 10) return 0;
  if (karma < 50) return 0.2;
  if (karma < 100) return 0.4;
  if (karma < 500) return 0.6;
  return 0.8;
}

export type Milestone = "Newcomer" | "Contributor" | "Trusted" | "Established";

export function karmaMilestone(karma: number): Milestone {
  if (karma < 10) return "Newcomer";
  if (karma < 50) return "Contributor";
  if (karma < 100) return "Trusted";
  return "Established";
}

/** Warmup daily post cap from account age since warmupStartedAt */
export function warmupDailyCap(warmupStartedAt: Date, now = new Date()): number {
  const day = Math.floor((now.getTime() - warmupStartedAt.getTime()) / 86_400_000) + 1;
  if (day <= 2) return 0; // browse only
  if (day <= 4) return 1;
  if (day <= 6) return 2;
  return Number.POSITIVE_INFINITY; // full pace (plan cap still applies)
}

export function isInWarmup(karma: number): boolean {
  return karma < 10;
}
