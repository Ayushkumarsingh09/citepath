import { PLAN_LIMITS, effectiveLimits, type PlanTier } from "@citepath/shared";
import { AppError } from "@citepath/shared";
import { prisma } from "@citepath/db";

export async function getEntitlements(workspaceId: string) {
  const sub = await prisma.subscription.findUnique({ where: { workspaceId } });
  const plan = (sub?.plan ?? "TRIAL") as PlanTier;
  const scanningPaused =
    !sub ||
    sub.status === "EXPIRED" ||
    sub.status === "CANCELED" ||
    (sub.status === "TRIALING" && sub.trialEndsAt && sub.trialEndsAt < new Date());

  const limits = effectiveLimits(plan, {
    addonDraftBundles: sub?.addonDraftBundles,
    addonCampaigns: sub?.addonCampaigns,
    addonMonitorDomains: sub?.addonMonitorDomains,
    addonVisibilityPrompts: sub?.addonVisibilityPrompts,
  });

  return { plan, status: sub?.status ?? "EXPIRED", limits, scanningPaused, subscription: sub };
}

export async function assertCampaignCapacity(workspaceId: string) {
  const { limits } = await getEntitlements(workspaceId);
  const count = await prisma.campaign.count({
    where: { workspaceId, deletedAt: null },
  });
  if (count >= limits.campaigns) {
    throw new AppError("LIMIT_REACHED", "Campaign limit reached for your plan", 402, {
      limit: limits.campaigns,
      addon: "campaign",
    });
  }
}

export async function assertSubredditCapacity(workspaceId: string) {
  const { limits } = await getEntitlements(workspaceId);
  const count = await prisma.workspaceSubreddit.count({ where: { workspaceId } });
  if (count >= limits.subreddits) {
    throw new AppError("LIMIT_REACHED", "Subreddit limit reached for your plan", 402, {
      limit: limits.subreddits,
    });
  }
}

export async function assertAccountCapacity(workspaceId: string) {
  const { limits } = await getEntitlements(workspaceId);
  const count = await prisma.redditAccount.count({ where: { workspaceId } });
  if (count >= limits.redditAccounts) {
    throw new AppError("LIMIT_REACHED", "Reddit account limit reached", 402, {
      limit: limits.redditAccounts,
    });
  }
}

export async function draftsUsedToday(workspaceId: string, advocateId?: string) {
  const start = new Date();
  start.setUTCHours(0, 0, 0, 0);
  return prisma.draft.count({
    where: {
      workspaceId,
      createdAt: { gte: start },
      deletedAt: null,
      ...(advocateId ? { advocateId } : {}),
    },
  });
}

export { PLAN_LIMITS };
