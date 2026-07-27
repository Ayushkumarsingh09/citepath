import {
  computeOpportunityScore,
  engagementPotential,
  freshnessScore,
  intentClassification,
  lexicalOverlap,
  promotionalRatio,
} from "@citepath/shared";
import { prisma } from "@citepath/db";
import { getEntitlements, draftsUsedToday } from "./entitlements";
import { fetchSubredditPosts, lookupRedditUser } from "./reddit";
import { generateDraftComment } from "./ai";

export async function runWorkspaceScan(workspaceId: string) {
  const { scanningPaused, limits } = await getEntitlements(workspaceId);
  if (scanningPaused) {
    throw new Error("Scanning paused — subscription inactive or trial expired");
  }

  const settings = await prisma.workspaceSettings.findUnique({ where: { workspaceId } });
  const threshold = settings?.relevanceThreshold ?? 0.5;

  const scan = await prisma.scanRun.create({
    data: { workspaceId, status: "RUNNING", startedAt: new Date() },
  });

  try {
    const campaigns = await prisma.campaign.findMany({
      where: { workspaceId, active: true, deletedAt: null },
      include: {
        subreddits: { where: { active: true }, include: { workspaceSubreddit: true } },
        advocates: { where: { active: true, deletedAt: null }, include: { redditAccount: true } },
        documents: true,
      },
    });

    let postsFound = 0;
    let draftsGenerated = 0;
    const usedToday = await draftsUsedToday(workspaceId);
    let remaining = Math.max(0, limits.draftsPerDay - usedToday);

    for (const campaign of campaigns) {
      if (remaining <= 0) break;
      const keywords = [
        campaign.name,
        campaign.productName ?? "",
        ...(campaign.description?.split(/\W+/).filter((w) => w.length > 3) ?? []),
      ].filter(Boolean);

      for (const link of campaign.subreddits) {
        if (remaining <= 0) break;
        const sub = link.workspaceSubreddit.name;
        const posts = await fetchSubredditPosts(sub, 25);
        postsFound += posts.length;

        for (const post of posts) {
          if (remaining <= 0) break;

          const stored = await prisma.redditPost.upsert({
            where: { externalId: post.externalId },
            create: post,
            update: {
              score: post.score,
              numComments: post.numComments,
              title: post.title,
              body: post.body,
            },
          });

          const text = `${stored.title}\n${stored.body ?? ""}`;
          let semantic = lexicalOverlap(text, keywords);
          const intent = intentClassification(stored.title, stored.body);
          // In demo mode, intentful synthetic posts should clear the default threshold
          if (stored.isDemo && intent >= 0.4) {
            semantic = Math.max(semantic, 0.65);
          }
          const productFit = lexicalOverlap(text, [
            campaign.productName ?? campaign.name,
            campaign.productUrl ?? "",
          ]);
          const components = {
            semanticRelevance: semantic,
            intent,
            productFit: Math.max(productFit, semantic * 0.7),
            freshness: freshnessScore(stored.createdUtc),
            engagementPotential: engagementPotential(stored.score, stored.numComments),
            geoPotential: Math.min(1, semantic * 0.8 + intent * 0.2),
            promotionalRisk: /buy now|discount code|use my link/i.test(text) ? 0.9 : 0.15,
          };
          const { finalScore, components: c, weights } = computeOpportunityScore(components);
          if (finalScore < threshold) continue;

          const opportunity = await prisma.opportunity.upsert({
            where: { campaignId_postId: { campaignId: campaign.id, postId: stored.id } },
            create: {
              workspaceId,
              campaignId: campaign.id,
              postId: stored.id,
              semanticRelevance: c.semanticRelevance,
              intentScore: c.intent,
              productFit: c.productFit,
              freshness: c.freshness,
              engagementPotential: c.engagementPotential,
              geoPotential: c.geoPotential,
              promotionalRisk: c.promotionalRisk,
              finalScore,
              scoreExplain: { components: c, weights },
            },
            update: {
              finalScore,
              semanticRelevance: c.semanticRelevance,
              intentScore: c.intent,
              productFit: c.productFit,
              freshness: c.freshness,
              engagementPotential: c.engagementPotential,
              geoPotential: c.geoPotential,
              promotionalRisk: c.promotionalRisk,
              scoreExplain: { components: c, weights },
            },
          });

          const existingDraft = await prisma.draft.findFirst({
            where: { opportunityId: opportunity.id, deletedAt: null },
          });
          if (existingDraft) continue;

          const advocate = campaign.advocates[0];
          const karma = advocate?.redditAccount?.karma ?? 0;
          const ratio = promotionalRatio(karma);
          const type = Math.random() < ratio ? "PROMOTIONAL" : "WARMUP";

          const kbChunks = await prisma.knowledgeChunk.findMany({
            where: { document: { campaignId: campaign.id } },
            select: { content: true },
            take: 20,
          });
          const knowledge =
            kbChunks.map((c) => c.content).join("\n").slice(0, 4000) ||
            campaign.documents.map((d) => d.content).join("\n").slice(0, 4000);

          const content = await generateDraftComment({
            type,
            advocate,
            campaign,
            post: stored,
            knowledge,
          });

          await prisma.draft.create({
            data: {
              workspaceId,
              campaignId: campaign.id,
              advocateId: advocate?.id,
              opportunityId: opportunity.id,
              content,
              type,
              status: "PENDING",
              model: process.env.AI_PROVIDER_API_KEY ? process.env.AI_MODEL ?? "gpt-4o-mini" : "demo-template",
              promptVersion: "v1",
              isDemo: !process.env.AI_PROVIDER_API_KEY || stored.isDemo,
              versions: {
                create: {
                  content,
                  source: "generate",
                  model: process.env.AI_PROVIDER_API_KEY ? process.env.AI_MODEL : "demo-template",
                },
              },
            },
          });
          draftsGenerated += 1;
          remaining -= 1;
        }
      }
    }

    if (draftsGenerated > 0) {
      const settings = await prisma.workspaceSettings.findUnique({ where: { workspaceId } });
      if (settings?.notifyDraftReady !== false) {
        const owners = await prisma.membership.findMany({
          where: { workspaceId, role: { in: ["OWNER", "ADMIN"] } },
        });
        await prisma.notification.createMany({
          data: owners.map((m) => ({
            workspaceId,
            userId: m.userId,
            type: "draft_ready",
            title: "New drafts ready",
            body: `${draftsGenerated} draft(s) waiting for approval.`,
          })),
        });
      }
    }

    const completedAt = new Date();
    await prisma.scanRun.update({
      where: { id: scan.id },
      data: {
        status: "SUCCEEDED",
        completedAt,
        durationMs: completedAt.getTime() - (scan.startedAt?.getTime() ?? completedAt.getTime()),
        postsFound,
        draftsGenerated,
      },
    });

    return { scanId: scan.id, postsFound, draftsGenerated };
  } catch (err) {
    await prisma.scanRun.update({
      where: { id: scan.id },
      data: {
        status: "FAILED",
        completedAt: new Date(),
        error: err instanceof Error ? err.message : "Scan failed",
      },
    });
    throw err;
  }
}

export { lookupRedditUser };
