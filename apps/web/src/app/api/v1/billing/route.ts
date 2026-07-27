import { z } from "zod";
import { prisma } from "@citepath/db";
import { jsonError, requireMembership } from "@/lib/auth";
import { getEntitlements } from "@/lib/entitlements";
import { PLAN_LIMITS, type PlanTier } from "@citepath/shared";

export async function GET() {
  try {
    const { membership, workspace } = await requireMembership();
    if (membership.role === "MEMBER") {
      return Response.json(
        { error: { code: "FORBIDDEN", message: "Only owners and admins can view billing", details: {} } },
        { status: 403 },
      );
    }
    const entitlements = await getEntitlements(workspace.id);
    const [campaigns, subreddits, accounts, domains, prompts, draftsToday] = await Promise.all([
      prisma.campaign.count({ where: { workspaceId: workspace.id, deletedAt: null } }),
      prisma.workspaceSubreddit.count({ where: { workspaceId: workspace.id } }),
      prisma.redditAccount.count({ where: { workspaceId: workspace.id } }),
      prisma.brandMonitorBrand.count({ where: { workspaceId: workspace.id, isCompetitor: false } }),
      prisma.aIPrompt.count({ where: { workspaceId: workspace.id } }),
      prisma.draft.count({
        where: {
          workspaceId: workspace.id,
          createdAt: { gte: new Date(new Date().setUTCHours(0, 0, 0, 0)) },
          deletedAt: null,
        },
      }),
    ]);
    return Response.json({
      entitlements,
      usage: {
        campaigns: { used: campaigns, limit: entitlements.limits.campaigns },
        subreddits: { used: subreddits, limit: entitlements.limits.subreddits },
        redditAccounts: { used: accounts, limit: entitlements.limits.redditAccounts },
        monitorDomains: { used: domains, limit: entitlements.limits.monitorDomains },
        visibilityPrompts: { used: prompts, limit: entitlements.limits.visibilityPrompts },
        draftsToday: { used: draftsToday, limit: entitlements.limits.draftsPerDay },
      },
      catalog: PLAN_LIMITS,
      stripeConfigured: Boolean(process.env.STRIPE_SECRET_KEY),
    });
  } catch (err) {
    return jsonError(err);
  }
}

export async function POST(req: Request) {
  try {
    const { membership, workspace } = await requireMembership(["OWNER", "ADMIN"]);
    void membership;
    const body = await req.json();

    if (body.action === "checkout") {
      const data = z
        .object({
          plan: z.enum(["STARTER", "GROWTH", "PRO"]),
          interval: z.enum(["monthly", "yearly"]).default("yearly"),
        })
        .parse(body);

      if (process.env.STRIPE_SECRET_KEY) {
        // Stripe Checkout would be created here with price IDs from env
        return Response.json({
          url: null,
          message: "Configure STRIPE_PRICE_* IDs to enable hosted checkout",
          stripeConfigured: true,
        });
      }

      const sub = await prisma.subscription.upsert({
        where: { workspaceId: workspace.id },
        create: {
          workspaceId: workspace.id,
          plan: data.plan as PlanTier,
          status: "ACTIVE",
          trialEndsAt: null,
        },
        update: {
          plan: data.plan as PlanTier,
          status: "ACTIVE",
          trialEndsAt: null,
        },
      });
      return Response.json({ demo: true, subscription: sub });
    }

    if (body.action === "addon") {
      const data = z
        .object({
          type: z.enum(["draftBundle", "campaign", "monitorDomain", "visibilityPrompts"]),
          qty: z.number().int().positive().default(1),
        })
        .parse(body);
      const field =
        data.type === "draftBundle"
          ? "addonDraftBundles"
          : data.type === "campaign"
            ? "addonCampaigns"
            : data.type === "monitorDomain"
              ? "addonMonitorDomains"
              : "addonVisibilityPrompts";
      const sub = await prisma.subscription.update({
        where: { workspaceId: workspace.id },
        data: { [field]: { increment: data.qty } },
      });
      return Response.json({ demo: !process.env.STRIPE_SECRET_KEY, subscription: sub });
    }

    if (body.action === "portal") {
      return Response.json({
        url: null,
        message: process.env.STRIPE_SECRET_KEY
          ? "Create Stripe customer portal session with STRIPE_SECRET_KEY"
          : "Demo mode — manage plan via checkout actions",
      });
    }

    if (body.action === "cancel") {
      const sub = await prisma.subscription.update({
        where: { workspaceId: workspace.id },
        data: { status: "CANCELED" },
      });
      return Response.json({ subscription: sub });
    }

    return Response.json(
      { error: { code: "BAD_REQUEST", message: "Unknown action", details: {} } },
      { status: 400 },
    );
  } catch (err) {
    return jsonError(err);
  }
}
