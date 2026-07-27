export type PlanTier = "TRIAL" | "STARTER" | "GROWTH" | "PRO" | "AGENCY" | "ENTERPRISE";

/** Help Center baseline (EC11) — monthly USD */
export const PLAN_LIMITS = {
  TRIAL: {
    redditAccounts: 1,
    campaigns: 1,
    subreddits: 10,
    draftsPerDay: 5,
    monitorDomains: 1,
    visibilityPrompts: 10,
    slack: false,
    priceMonthly: 0,
  },
  STARTER: {
    redditAccounts: 1,
    campaigns: 1,
    subreddits: 10,
    draftsPerDay: 5,
    monitorDomains: 1,
    visibilityPrompts: 10,
    slack: false,
    priceMonthly: 59,
  },
  GROWTH: {
    redditAccounts: 3,
    campaigns: 5,
    subreddits: 30,
    draftsPerDay: 15,
    monitorDomains: 3,
    visibilityPrompts: 100,
    slack: true,
    priceMonthly: 149,
  },
  PRO: {
    redditAccounts: 999,
    campaigns: 10,
    subreddits: 100,
    draftsPerDay: 25,
    monitorDomains: 5,
    visibilityPrompts: 200,
    slack: true,
    priceMonthly: 299,
  },
  AGENCY: {
    redditAccounts: 999,
    campaigns: 999,
    subreddits: 999,
    draftsPerDay: 100,
    monitorDomains: 50,
    visibilityPrompts: 1000,
    slack: true,
    priceMonthly: null as number | null,
  },
  ENTERPRISE: {
    redditAccounts: 999,
    campaigns: 999,
    subreddits: 999,
    draftsPerDay: 999,
    monitorDomains: 999,
    visibilityPrompts: 9999,
    slack: true,
    priceMonthly: null as number | null,
  },
} as const;

export const ADDON_PRICES = {
  draftBundle: 20, // +5 drafts/day
  campaign: 25,
  monitorDomain: 25,
  visibilityPrompts: 100, // +100
} as const;

export function effectiveLimits(
  plan: PlanTier,
  addons: {
    addonDraftBundles?: number;
    addonCampaigns?: number;
    addonMonitorDomains?: number;
    addonVisibilityPrompts?: number;
  } = {},
) {
  const base = PLAN_LIMITS[plan];
  return {
    ...base,
    draftsPerDay: base.draftsPerDay + (addons.addonDraftBundles ?? 0) * 5,
    campaigns: base.campaigns + (addons.addonCampaigns ?? 0),
    monitorDomains: base.monitorDomains + (addons.addonMonitorDomains ?? 0),
    visibilityPrompts: base.visibilityPrompts + (addons.addonVisibilityPrompts ?? 0) * 100,
  };
}
