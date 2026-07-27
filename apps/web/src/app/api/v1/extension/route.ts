import { prisma } from "@citepath/db";
import { jsonError, requireMembership } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const { user, workspace } = await requireMembership();
    const url = new URL(req.url);
    const action = url.searchParams.get("action");

    if (action === "queue") {
      const jobs = await prisma.publishingJob.findMany({
        where: { workspaceId: workspace.id, status: { in: ["QUEUED", "CLAIMING"] } },
        include: {
          draft: {
            include: { opportunity: { include: { post: true } }, advocate: { include: { redditAccount: true } } },
          },
        },
        take: 20,
        orderBy: { createdAt: "asc" },
      });
      return Response.json({
        jobs: jobs.map((j) => ({
          id: j.id,
          draftId: j.draftId,
          content: j.draft.content,
          permalink: j.draft.opportunity?.post.permalink,
          subreddit: j.draft.opportunity?.post.subreddit,
          redditUsername: j.draft.advocate?.redditAccount?.username,
        })),
      });
    }

    return Response.json({ userId: user.id, workspaceId: workspace.id, connected: true });
  } catch (err) {
    return jsonError(err);
  }
}

export async function POST(req: Request) {
  try {
    const { user, workspace } = await requireMembership();
    const body = await req.json();

    if (body.action === "activity") {
      await prisma.extensionActivity.create({
        data: {
          workspaceId: workspace.id,
          userId: user.id,
          type: String(body.type ?? "unknown"),
          payloadJson: body.payload ?? {},
        },
      });
      return Response.json({ ok: true });
    }

    if (body.action === "claim") {
      const job = await prisma.publishingJob.findFirst({
        where: { id: body.jobId, workspaceId: workspace.id, status: "QUEUED" },
      });
      if (!job) {
        return Response.json(
          { error: { code: "NOT_FOUND", message: "Job not available", details: {} } },
          { status: 404 },
        );
      }
      const updated = await prisma.publishingJob.update({
        where: { id: job.id },
        data: { status: "CLAIMING", claimedBy: user.id, claimedAt: new Date(), attempts: { increment: 1 } },
      });
      return Response.json({ job: updated });
    }

    if (body.action === "complete") {
      const job = await prisma.publishingJob.findFirst({
        where: { id: body.jobId, workspaceId: workspace.id },
        include: { draft: true },
      });
      if (!job) {
        return Response.json(
          { error: { code: "NOT_FOUND", message: "Job not found", details: {} } },
          { status: 404 },
        );
      }
      await prisma.$transaction([
        prisma.publishingJob.update({
          where: { id: job.id },
          data: { status: "SUCCEEDED", completedAt: new Date() },
        }),
        prisma.draft.update({
          where: { id: job.draftId },
          data: {
            status: "PUBLISHED",
            publishedAt: new Date(),
            redditCommentId: body.redditCommentId ?? null,
          },
        }),
        prisma.publishedContent.upsert({
          where: { draftId: job.draftId },
          create: {
            draftId: job.draftId,
            redditCommentId: body.redditCommentId,
            permalink: body.permalink,
          },
          update: {
            redditCommentId: body.redditCommentId,
            permalink: body.permalink,
          },
        }),
        prisma.extensionActivity.create({
          data: {
            workspaceId: workspace.id,
            userId: user.id,
            type: "comment_posted",
            payloadJson: { draftId: job.draftId, permalink: body.permalink },
          },
        }),
      ]);
      return Response.json({ ok: true });
    }

    if (body.action === "fail") {
      await prisma.publishingJob.updateMany({
        where: { id: body.jobId, workspaceId: workspace.id },
        data: {
          status: body.permanent ? "FAILED_PERMANENT" : "FAILED_RETRYABLE",
          lastError: body.error ?? "Unknown",
        },
      });
      if (!body.permanent) {
        await prisma.publishingJob.updateMany({
          where: { id: body.jobId, workspaceId: workspace.id },
          data: { status: "QUEUED" },
        });
      }
      return Response.json({ ok: true });
    }

    return Response.json(
      { error: { code: "BAD_REQUEST", message: "Unknown action", details: {} } },
      { status: 400 },
    );
  } catch (err) {
    return jsonError(err);
  }
}
