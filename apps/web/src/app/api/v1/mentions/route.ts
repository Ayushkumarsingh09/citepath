import { z } from "zod";
import { prisma } from "@citepath/db";
import { jsonError, requireMembership } from "@/lib/auth";
import { getEntitlements } from "@/lib/entitlements";
import { AppError } from "@citepath/shared";

export async function GET() {
  try {
    const { workspace } = await requireMembership();
    const [brands, mentions] = await Promise.all([
      prisma.brandMonitorBrand.findMany({ where: { workspaceId: workspace.id } }),
      prisma.mention.findMany({
        where: { workspaceId: workspace.id },
        include: { brand: true },
        orderBy: { detectedAt: "desc" },
        take: 100,
      }),
    ]);
    return Response.json({ brands, mentions });
  } catch (err) {
    return jsonError(err);
  }
}

export async function POST(req: Request) {
  try {
    const { workspace } = await requireMembership();
    const body = await req.json();
    if (body.action === "add_brand") {
      const entitlements = await getEntitlements(workspace.id);
      const count = await prisma.brandMonitorBrand.count({
        where: { workspaceId: workspace.id, isCompetitor: false },
      });
      if (count >= entitlements.limits.monitorDomains) {
        throw new AppError("LIMIT_REACHED", "Brand Monitor domain limit reached", 402);
      }
      const data = z.object({ name: z.string().min(1), domain: z.string().optional() }).parse(body);
      const brand = await prisma.brandMonitorBrand.create({
        data: {
          workspaceId: workspace.id,
          name: data.name,
          domain: data.domain,
        },
      });
      // seed a clearly marked demo mention so UI isn't empty
      if (process.env.DEMO_MODE === "true") {
        await prisma.mention.create({
          data: {
            workspaceId: workspace.id,
            brandId: brand.id,
            title: `[Demo] Discussion mentioning ${data.name}`,
            url: "https://www.reddit.com/r/saas/comments/demo_mention",
            subreddit: "saas",
            sentiment: "NEUTRAL",
            snippet: "People are comparing tools in this thread.",
            isDemo: true,
          },
        });
      }
      return Response.json({ brand });
    }
    return Response.json(
      { error: { code: "BAD_REQUEST", message: "Unknown action", details: {} } },
      { status: 400 },
    );
  } catch (err) {
    return jsonError(err);
  }
}
