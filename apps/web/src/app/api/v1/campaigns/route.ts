import { z } from "zod";
import { prisma } from "@citepath/db";
import { jsonError, requireMembership } from "@/lib/auth";
import { assertCampaignCapacity } from "@/lib/entitlements";

export async function GET() {
  try {
    const { workspace } = await requireMembership();
    const campaigns = await prisma.campaign.findMany({
      where: { workspaceId: workspace.id, deletedAt: null },
      include: {
        _count: { select: { advocates: true, drafts: true, subreddits: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    return Response.json({ campaigns });
  } catch (err) {
    return jsonError(err);
  }
}

export async function POST(req: Request) {
  try {
    const { workspace } = await requireMembership();
    await assertCampaignCapacity(workspace.id);
    const data = z
      .object({
        name: z.string().min(1),
        productName: z.string().optional(),
        productUrl: z.string().url().optional().or(z.literal("")),
        description: z.string().optional(),
      })
      .parse(await req.json());

    const campaign = await prisma.campaign.create({
      data: {
        workspaceId: workspace.id,
        name: data.name,
        productName: data.productName,
        productUrl: data.productUrl || null,
        description: data.description,
      },
    });
    return Response.json({ campaign }, { status: 201 });
  } catch (err) {
    return jsonError(err);
  }
}

export async function PATCH(req: Request) {
  try {
    const { workspace } = await requireMembership();
    const data = z
      .object({
        id: z.string(),
        active: z.boolean().optional(),
        name: z.string().optional(),
        description: z.string().optional(),
        productName: z.string().optional(),
        productUrl: z.string().optional(),
      })
      .parse(await req.json());

    const existing = await prisma.campaign.findFirst({
      where: { id: data.id, workspaceId: workspace.id, deletedAt: null },
    });
    if (!existing) {
      return Response.json(
        { error: { code: "NOT_FOUND", message: "Campaign not found", details: {} } },
        { status: 404 },
      );
    }

    const campaign = await prisma.campaign.update({
      where: { id: data.id },
      data: {
        active: data.active,
        name: data.name,
        description: data.description,
        productName: data.productName,
        productUrl: data.productUrl,
      },
    });
    return Response.json({ campaign });
  } catch (err) {
    return jsonError(err);
  }
}
