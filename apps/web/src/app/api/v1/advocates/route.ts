import { z } from "zod";
import { prisma } from "@citepath/db";
import { jsonError, requireMembership } from "@/lib/auth";

export async function GET() {
  try {
    const { workspace } = await requireMembership();
    const advocates = await prisma.advocate.findMany({
      where: { deletedAt: null, campaign: { workspaceId: workspace.id } },
      include: {
        campaign: { select: { id: true, name: true } },
        redditAccount: true,
      },
      orderBy: { createdAt: "desc" },
    });
    return Response.json({ advocates });
  } catch (err) {
    return jsonError(err);
  }
}

export async function POST(req: Request) {
  try {
    const { workspace } = await requireMembership();
    const data = z
      .object({
        campaignId: z.string(),
        name: z.string().min(1),
        description: z.string().optional(),
        role: z.enum(["Regular User", "Employee"]).default("Regular User"),
        tone: z.string().default("helpful"),
        creativity: z.number().min(0).max(1).default(0.5),
        writingGuidelines: z.string().optional(),
        dailyDraftAllocation: z.number().int().positive().default(5),
        redditAccountId: z.string().optional(),
      })
      .parse(await req.json());

    const campaign = await prisma.campaign.findFirst({
      where: { id: data.campaignId, workspaceId: workspace.id, deletedAt: null },
    });
    if (!campaign) {
      return Response.json(
        { error: { code: "NOT_FOUND", message: "Campaign not found", details: {} } },
        { status: 404 },
      );
    }

    const advocate = await prisma.advocate.create({
      data: {
        campaignId: data.campaignId,
        name: data.name,
        description: data.description,
        role: data.role,
        tone: data.tone,
        creativity: data.creativity,
        writingGuidelines: data.writingGuidelines,
        dailyDraftAllocation: data.dailyDraftAllocation,
        redditAccountId: data.redditAccountId,
      },
    });
    return Response.json({ advocate }, { status: 201 });
  } catch (err) {
    return jsonError(err);
  }
}

export async function PATCH(req: Request) {
  try {
    const { workspace } = await requireMembership();
    const body = await req.json();

    if (body.action === "refine") {
      const data = z
        .object({
          id: z.string(),
          rewrites: z.array(z.object({ original: z.string(), rewrite: z.string() })).min(1),
        })
        .parse(body);
      const advocate = await prisma.advocate.findFirst({
        where: { id: data.id, deletedAt: null, campaign: { workspaceId: workspace.id } },
      });
      if (!advocate) {
        return Response.json(
          { error: { code: "NOT_FOUND", message: "Advocate not found", details: {} } },
          { status: 404 },
        );
      }
      const samples = data.rewrites.map((r) => r.rewrite).join("\n---\n");
      const guidelines = `Derived from ${data.rewrites.length} user rewrites. Prefer this voice:\n${samples.slice(0, 3000)}`;
      const updated = await prisma.advocate.update({
        where: { id: advocate.id },
        data: { voiceGuidelines: guidelines },
      });
      return Response.json({ advocate: updated });
    }

    const data = z
      .object({
        id: z.string(),
        name: z.string().optional(),
        tone: z.string().optional(),
        creativity: z.number().optional(),
        writingGuidelines: z.string().optional(),
        redditAccountId: z.string().nullable().optional(),
        active: z.boolean().optional(),
      })
      .parse(body);

    const advocate = await prisma.advocate.findFirst({
      where: { id: data.id, deletedAt: null, campaign: { workspaceId: workspace.id } },
    });
    if (!advocate) {
      return Response.json(
        { error: { code: "NOT_FOUND", message: "Advocate not found", details: {} } },
        { status: 404 },
      );
    }

    const updated = await prisma.advocate.update({
      where: { id: data.id },
      data: {
        name: data.name,
        tone: data.tone,
        creativity: data.creativity,
        writingGuidelines: data.writingGuidelines,
        redditAccountId: data.redditAccountId === undefined ? undefined : data.redditAccountId,
        active: data.active,
      },
    });
    return Response.json({ advocate: updated });
  } catch (err) {
    return jsonError(err);
  }
}
