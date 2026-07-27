import { z } from "zod";
import { prisma } from "@citepath/db";
import { jsonError, requireMembership } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const { workspace } = await requireMembership();
    const url = new URL(req.url);
    const status = url.searchParams.get("status");
    const tab = url.searchParams.get("tab");

    const where: Record<string, unknown> = {
      workspaceId: workspace.id,
      deletedAt: null,
    };

    if (status) where.status = status;
    else if (tab === "waiting") where.status = "PENDING";
    else if (tab === "queue") where.status = "QUEUED";
    else if (tab === "published") where.status = "PUBLISHED";
    else if (tab === "archive") where.status = "ARCHIVED";

    const drafts = await prisma.draft.findMany({
      where,
      include: {
        campaign: { select: { id: true, name: true } },
        advocate: { select: { id: true, name: true } },
        opportunity: { include: { post: true } },
        publishingJob: true,
      },
      orderBy: { createdAt: "desc" },
      take: 100,
    });
    return Response.json({ drafts });
  } catch (err) {
    return jsonError(err);
  }
}

export async function PATCH(req: Request) {
  try {
    const { user, workspace } = await requireMembership();
    const data = z
      .object({
        id: z.string(),
        action: z.enum(["approve", "archive", "copy_open", "edit"]),
        content: z.string().optional(),
      })
      .parse(await req.json());

    const draft = await prisma.draft.findFirst({
      where: { id: data.id, workspaceId: workspace.id, deletedAt: null },
      include: { opportunity: { include: { post: true } }, publishingJob: true },
    });
    if (!draft) {
      return Response.json(
        { error: { code: "NOT_FOUND", message: "Draft not found", details: {} } },
        { status: 404 },
      );
    }

    if (data.action === "edit" && data.content) {
      const updated = await prisma.draft.update({
        where: { id: draft.id },
        data: {
          content: data.content,
          versions: { create: { content: data.content, source: "edit" } },
        },
      });
      return Response.json({ draft: updated });
    }

    if (data.action === "archive") {
      const updated = await prisma.draft.update({
        where: { id: draft.id },
        data: { status: "ARCHIVED" },
      });
      return Response.json({ draft: updated });
    }

    if (data.action === "approve") {
      if (draft.status !== "PENDING") {
        return Response.json(
          { error: { code: "INVALID_STATE", message: "Only pending drafts can be approved", details: {} } },
          { status: 409 },
        );
      }
      const updated = await prisma.$transaction(async (tx) => {
        const d = await tx.draft.update({
          where: { id: draft.id },
          data: { status: "QUEUED" },
        });
        if (!draft.publishingJob) {
          await tx.publishingJob.create({
            data: { draftId: draft.id, workspaceId: workspace.id, status: "QUEUED" },
          });
        }
        await tx.auditLog.create({
          data: {
            workspaceId: workspace.id,
            userId: user.id,
            action: "draft.approve",
            entityType: "Draft",
            entityId: draft.id,
          },
        });
        return d;
      });
      return Response.json({ draft: updated });
    }

    if (data.action === "copy_open") {
      const updated = await prisma.$transaction(async (tx) => {
        const d = await tx.draft.update({
          where: { id: draft.id },
          data: { status: "PUBLISHED", publishedAt: new Date() },
        });
        await tx.publishedContent.upsert({
          where: { draftId: draft.id },
          create: {
            draftId: draft.id,
            permalink: draft.opportunity?.post.permalink,
          },
          update: {},
        });
        return d;
      });
      return Response.json({
        draft: updated,
        openUrl: draft.opportunity?.post.permalink,
        content: draft.content,
      });
    }

    return Response.json(
      { error: { code: "BAD_REQUEST", message: "Unknown action", details: {} } },
      { status: 400 },
    );
  } catch (err) {
    return jsonError(err);
  }
}
