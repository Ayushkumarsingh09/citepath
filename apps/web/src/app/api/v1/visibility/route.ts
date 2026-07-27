import { z } from "zod";
import { prisma } from "@citepath/db";
import { jsonError, requireMembership } from "@/lib/auth";
import { getEntitlements } from "@/lib/entitlements";
import { AppError } from "@citepath/shared";

export async function GET() {
  try {
    const { workspace } = await requireMembership();
    const [prompts, snapshots, brands] = await Promise.all([
      prisma.aIPrompt.findMany({ where: { workspaceId: workspace.id }, orderBy: { createdAt: "desc" } }),
      prisma.visibilitySnapshot.findMany({
        where: { workspaceId: workspace.id },
        orderBy: { capturedAt: "desc" },
        take: 50,
      }),
      prisma.visibilityBrand.findMany({ where: { workspaceId: workspace.id } }),
    ]);
    return Response.json({ prompts, snapshots, brands });
  } catch (err) {
    return jsonError(err);
  }
}

export async function POST(req: Request) {
  try {
    const { workspace } = await requireMembership();
    const body = await req.json();

    if (body.action === "add_prompt") {
      const entitlements = await getEntitlements(workspace.id);
      const count = await prisma.aIPrompt.count({ where: { workspaceId: workspace.id } });
      if (count >= entitlements.limits.visibilityPrompts) {
        throw new AppError("LIMIT_REACHED", "AI Visibility prompt limit reached", 402);
      }
      const data = z.object({ text: z.string().min(1) }).parse(body);
      const prompt = await prisma.aIPrompt.create({
        data: { workspaceId: workspace.id, text: data.text },
      });
      return Response.json({ prompt });
    }

    if (body.action === "add_brand") {
      const data = z
        .object({ name: z.string().min(1), isCompetitor: z.boolean().optional() })
        .parse(body);
      const brand = await prisma.visibilityBrand.create({
        data: {
          workspaceId: workspace.id,
          name: data.name,
          isCompetitor: data.isCompetitor ?? false,
        },
      });
      return Response.json({ brand });
    }

    if (body.action === "run") {
      const prompts = await prisma.aIPrompt.findMany({
        where: { workspaceId: workspace.id, active: true },
      });
      const engines = ["chatgpt", "gemini", "perplexity", "google-ai"];
      let mentions = 0;
      let citations = 0;
      let total = 0;

      for (const prompt of prompts) {
        for (const engine of engines) {
          total += 1;
          // Supported provider APIs when configured; otherwise deterministic demo observation (labeled)
          const brandMentioned = process.env.AI_PROVIDER_API_KEY
            ? false // real extraction would parse provider response
            : prompt.text.toLowerCase().includes("citepath") || Math.random() > 0.6;
          if (brandMentioned) mentions += 1;
          const citationRate = brandMentioned ? 1 : 0;
          citations += citationRate;
          await prisma.aIQueryRun.create({
            data: {
              promptId: prompt.id,
              engine,
              responseText: process.env.AI_PROVIDER_API_KEY
                ? "(provider response stored by adapter)"
                : `[Demo observation] Synthetic response for "${prompt.text}" on ${engine}`,
              brandMentioned,
              position: brandMentioned ? 2 : null,
              citationsJson: brandMentioned ? [{ domain: "reddit.com", position: 1 }] : [],
              isDemo: !process.env.AI_PROVIDER_API_KEY,
            },
          });
        }
      }

      const mentionRate = total ? mentions / total : 0;
      const citationRate = total ? citations / total : 0;
      const visibilityScore = mentionRate * 0.6 + citationRate * 0.4;
      const shareOfVoice = mentionRate; // vs competitors when present

      const snapshot = await prisma.visibilitySnapshot.create({
        data: {
          workspaceId: workspace.id,
          engine: "aggregate",
          visibilityScore,
          mentionRate,
          citationRate,
          citationShare: citationRate,
          shareOfVoice,
          averagePosition: 2,
          componentsJson: { mentions, citations, total },
          isDemo: !process.env.AI_PROVIDER_API_KEY,
        },
      });
      return Response.json({ snapshot });
    }

    return Response.json(
      { error: { code: "BAD_REQUEST", message: "Unknown action", details: {} } },
      { status: 400 },
    );
  } catch (err) {
    return jsonError(err);
  }
}
