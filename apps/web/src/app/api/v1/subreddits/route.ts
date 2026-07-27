import { z } from "zod";
import { prisma } from "@citepath/db";
import { jsonError, requireMembership } from "@/lib/auth";
import { assertSubredditCapacity } from "@/lib/entitlements";

export async function GET() {
  try {
    const { workspace } = await requireMembership();
    const subreddits = await prisma.workspaceSubreddit.findMany({
      where: { workspaceId: workspace.id },
      include: { campaigns: { include: { campaign: { select: { id: true, name: true } } } } },
      orderBy: { name: "asc" },
    });
    return Response.json({ subreddits });
  } catch (err) {
    return jsonError(err);
  }
}

export async function POST(req: Request) {
  try {
    const { workspace } = await requireMembership();
    const body = await req.json();

    if (body.action === "import_csv") {
      const data = z.object({ names: z.array(z.string()).min(1) }).parse(body);
      const created = [];
      for (const raw of data.names) {
        const name = raw.replace(/^r\//i, "").trim().toLowerCase();
        if (!name) continue;
        const count = await prisma.workspaceSubreddit.count({ where: { workspaceId: workspace.id } });
        const { limits } = await import("@/lib/entitlements").then((m) => m.getEntitlements(workspace.id));
        if (count >= limits.subreddits) break;
        const sub = await prisma.workspaceSubreddit.upsert({
          where: { workspaceId_name: { workspaceId: workspace.id, name } },
          create: { workspaceId: workspace.id, name },
          update: {},
        });
        created.push(sub);
      }
      return Response.json({ subreddits: created });
    }

    if (body.action === "assign") {
      const data = z
        .object({ subredditId: z.string(), campaignId: z.string(), active: z.boolean().default(true) })
        .parse(body);
      const sub = await prisma.workspaceSubreddit.findFirst({
        where: { id: data.subredditId, workspaceId: workspace.id },
      });
      const campaign = await prisma.campaign.findFirst({
        where: { id: data.campaignId, workspaceId: workspace.id, deletedAt: null },
      });
      if (!sub || !campaign) {
        return Response.json(
          { error: { code: "NOT_FOUND", message: "Subreddit or campaign not found", details: {} } },
          { status: 404 },
        );
      }
      const link = await prisma.campaignSubreddit.upsert({
        where: {
          campaignId_workspaceSubredditId: {
            campaignId: data.campaignId,
            workspaceSubredditId: data.subredditId,
          },
        },
        create: {
          campaignId: data.campaignId,
          workspaceSubredditId: data.subredditId,
          active: data.active,
        },
        update: { active: data.active },
      });
      return Response.json({ link });
    }

    await assertSubredditCapacity(workspace.id);
    const data = z.object({ name: z.string().min(1), campaignId: z.string().optional() }).parse(body);
    const name = data.name.replace(/^r\//i, "").trim().toLowerCase();
    const subreddit = await prisma.workspaceSubreddit.upsert({
      where: { workspaceId_name: { workspaceId: workspace.id, name } },
      create: { workspaceId: workspace.id, name },
      update: {},
    });
    if (data.campaignId) {
      await prisma.campaignSubreddit.upsert({
        where: {
          campaignId_workspaceSubredditId: {
            campaignId: data.campaignId,
            workspaceSubredditId: subreddit.id,
          },
        },
        create: { campaignId: data.campaignId, workspaceSubredditId: subreddit.id },
        update: {},
      });
    }
    return Response.json({ subreddit }, { status: 201 });
  } catch (err) {
    return jsonError(err);
  }
}

export async function PATCH(req: Request) {
  try {
    const { workspace } = await requireMembership();
    const data = z
      .object({ id: z.string(), active: z.boolean().optional(), ids: z.array(z.string()).optional() })
      .parse(await req.json());

    if (data.ids?.length) {
      await prisma.workspaceSubreddit.updateMany({
        where: { workspaceId: workspace.id, id: { in: data.ids } },
        data: { active: data.active },
      });
      return Response.json({ ok: true });
    }

    const sub = await prisma.workspaceSubreddit.findFirst({
      where: { id: data.id, workspaceId: workspace.id },
    });
    if (!sub) {
      return Response.json(
        { error: { code: "NOT_FOUND", message: "Not found", details: {} } },
        { status: 404 },
      );
    }
    const updated = await prisma.workspaceSubreddit.update({
      where: { id: data.id },
      data: { active: data.active },
    });
    return Response.json({ subreddit: updated });
  } catch (err) {
    return jsonError(err);
  }
}
