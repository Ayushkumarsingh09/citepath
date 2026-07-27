import { z } from "zod";
import { prisma } from "@citepath/db";
import { jsonError, requireMembership } from "@/lib/auth";
import { chunkText, isSafePublicUrl, rankChunks } from "@/lib/knowledge";

export async function GET(req: Request) {
  try {
    const { workspace } = await requireMembership();
    const campaignId = new URL(req.url).searchParams.get("campaignId");
    if (!campaignId) {
      return Response.json(
        { error: { code: "BAD_REQUEST", message: "campaignId required", details: {} } },
        { status: 400 },
      );
    }
    const campaign = await prisma.campaign.findFirst({
      where: { id: campaignId, workspaceId: workspace.id, deletedAt: null },
    });
    if (!campaign) {
      return Response.json(
        { error: { code: "NOT_FOUND", message: "Campaign not found", details: {} } },
        { status: 404 },
      );
    }
    const documents = await prisma.knowledgeDocument.findMany({
      where: { campaignId },
      include: { _count: { select: { chunks: true } } },
      orderBy: { createdAt: "desc" },
    });
    return Response.json({ documents });
  } catch (err) {
    return jsonError(err);
  }
}

export async function POST(req: Request) {
  try {
    const { workspace } = await requireMembership();
    const body = await req.json();

    if (body.action === "retrieve") {
      const data = z
        .object({ campaignId: z.string(), query: z.string(), topK: z.number().optional() })
        .parse(body);
      const campaign = await prisma.campaign.findFirst({
        where: { id: data.campaignId, workspaceId: workspace.id, deletedAt: null },
      });
      if (!campaign) {
        return Response.json(
          { error: { code: "NOT_FOUND", message: "Campaign not found", details: {} } },
          { status: 404 },
        );
      }
      const chunks = await prisma.knowledgeChunk.findMany({
        where: { document: { campaignId: data.campaignId } },
        select: { id: true, content: true },
        take: 500,
      });
      return Response.json({ chunks: rankChunks(chunks, data.query, data.topK ?? 5) });
    }

    if (body.action === "upload_text") {
      const data = z
        .object({
          campaignId: z.string(),
          title: z.string().min(1),
          content: z.string().min(1),
          sourceType: z.string().default("txt"),
        })
        .parse(body);
      const campaign = await prisma.campaign.findFirst({
        where: { id: data.campaignId, workspaceId: workspace.id, deletedAt: null },
      });
      if (!campaign) {
        return Response.json(
          { error: { code: "NOT_FOUND", message: "Campaign not found", details: {} } },
          { status: 404 },
        );
      }
      const parts = chunkText(data.content);
      const doc = await prisma.knowledgeDocument.create({
        data: {
          campaignId: data.campaignId,
          title: data.title,
          sourceType: data.sourceType,
          content: data.content.slice(0, 200_000),
          chunkCount: parts.length,
          status: "ready",
          chunks: {
            create: parts.map((content, ordinal) => ({ ordinal, content })),
          },
        },
        include: { _count: { select: { chunks: true } } },
      });
      return Response.json({ document: doc }, { status: 201 });
    }

    if (body.action === "ingest_url") {
      const data = z.object({ campaignId: z.string(), url: z.string().url() }).parse(body);
      if (!isSafePublicUrl(data.url)) {
        return Response.json(
          { error: { code: "SSRF_BLOCKED", message: "URL not allowed", details: {} } },
          { status: 400 },
        );
      }
      const campaign = await prisma.campaign.findFirst({
        where: { id: data.campaignId, workspaceId: workspace.id, deletedAt: null },
      });
      if (!campaign) {
        return Response.json(
          { error: { code: "NOT_FOUND", message: "Campaign not found", details: {} } },
          { status: 404 },
        );
      }
      const res = await fetch(data.url, {
        headers: { "User-Agent": process.env.REDDIT_USER_AGENT ?? "CitePath/0.1" },
        signal: AbortSignal.timeout(15000),
      });
      const html = await res.text();
      const text = html
        .replace(/<script[\s\S]*?<\/script>/gi, " ")
        .replace(/<style[\s\S]*?<\/style>/gi, " ")
        .replace(/<[^>]+>/g, " ")
        .replace(/\s+/g, " ")
        .trim()
        .slice(0, 200_000);
      const parts = chunkText(text);
      const doc = await prisma.knowledgeDocument.create({
        data: {
          campaignId: data.campaignId,
          title: data.url,
          sourceType: "url",
          sourceUrl: data.url,
          content: text,
          chunkCount: parts.length,
          status: "ready",
          chunks: { create: parts.map((content, ordinal) => ({ ordinal, content })) },
        },
      });
      return Response.json({ document: doc }, { status: 201 });
    }

    return Response.json(
      { error: { code: "BAD_REQUEST", message: "Unknown action", details: {} } },
      { status: 400 },
    );
  } catch (err) {
    return jsonError(err);
  }
}

export async function DELETE(req: Request) {
  try {
    const { workspace } = await requireMembership();
    const { id } = await req.json();
    const doc = await prisma.knowledgeDocument.findFirst({
      where: { id, campaign: { workspaceId: workspace.id } },
    });
    if (!doc) {
      return Response.json(
        { error: { code: "NOT_FOUND", message: "Not found", details: {} } },
        { status: 404 },
      );
    }
    await prisma.knowledgeDocument.delete({ where: { id } });
    return Response.json({ ok: true });
  } catch (err) {
    return jsonError(err);
  }
}
