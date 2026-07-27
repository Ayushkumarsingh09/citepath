import { prisma } from "@citepath/db";
import { jsonError, requireMembership } from "@/lib/auth";
import { draftsUsedToday, getEntitlements } from "@/lib/entitlements";
import { isInWarmup, promotionalRatio } from "@citepath/shared";

export async function GET() {
  try {
    const { workspace } = await requireMembership();
    const entitlements = await getEntitlements(workspace.id);

    const [pendingDrafts, recentDrafts, latestScan, accounts, campaigns, activeSubs, warnings] =
      await Promise.all([
        prisma.draft.count({
          where: { workspaceId: workspace.id, status: "PENDING", deletedAt: null },
        }),
        prisma.draft.findMany({
          where: { workspaceId: workspace.id, status: "PENDING", deletedAt: null },
          include: {
            campaign: { select: { name: true } },
            opportunity: { include: { post: true } },
          },
          orderBy: { createdAt: "desc" },
          take: 5,
        }),
        prisma.scanRun.findFirst({
          where: { workspaceId: workspace.id },
          orderBy: { createdAt: "desc" },
        }),
        prisma.redditAccount.findMany({ where: { workspaceId: workspace.id }, take: 5 }),
        prisma.campaign.count({ where: { workspaceId: workspace.id, active: true, deletedAt: null } }),
        prisma.workspaceSubreddit.count({ where: { workspaceId: workspace.id, active: true } }),
        Promise.resolve([] as string[]),
      ]);

    const setupWarnings: string[] = [];
    if (campaigns === 0) setupWarnings.push("Create an active campaign to start scanning.");
    if (activeSubs === 0) setupWarnings.push("Assign at least one active subreddit.");
    if (accounts.length === 0) setupWarnings.push("Connect a Reddit account (username only).");

    const used = await draftsUsedToday(workspace.id);

    return Response.json({
      pendingDrafts,
      recentDrafts,
      latestScan,
      accounts: accounts.map((a) => ({
        ...a,
        inWarmup: isInWarmup(a.karma),
        promotionalRatio: promotionalRatio(a.karma),
      })),
      entitlements,
      draftsUsedToday: used,
      setupWarnings: setupWarnings.length ? setupWarnings : warnings,
      demoMode: process.env.DEMO_MODE === "true",
    });
  } catch (err) {
    return jsonError(err);
  }
}
