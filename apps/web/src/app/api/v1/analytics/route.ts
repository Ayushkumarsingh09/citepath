import { prisma } from "@citepath/db";
import { jsonError, requireMembership } from "@/lib/auth";

export async function GET() {
  try {
    const { workspace } = await requireMembership();
    const published = await prisma.publishedContent.findMany({
      where: { draft: { workspaceId: workspace.id } },
      include: { draft: { include: { campaign: true } } },
    });
    const totals = published.reduce(
      (acc, p) => {
        acc.views += p.views;
        acc.upvotes += p.upvotes;
        acc.score += p.score;
        acc.count += 1;
        return acc;
      },
      { views: 0, upvotes: 0, score: 0, count: 0 },
    );
    const byCampaignMap = new Map<string, { name: string; views: number; upvotes: number }>();
    for (const p of published) {
      const name = p.draft.campaign.name;
      const cur = byCampaignMap.get(name) ?? { name, views: 0, upvotes: 0 };
      cur.views += p.views;
      cur.upvotes += p.upvotes;
      byCampaignMap.set(name, cur);
    }
    return Response.json({ totals, byCampaign: [...byCampaignMap.values()] });
  } catch (err) {
    return jsonError(err);
  }
}
