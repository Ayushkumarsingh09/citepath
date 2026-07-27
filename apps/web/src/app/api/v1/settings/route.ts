import { z } from "zod";
import { prisma } from "@citepath/db";
import { jsonError, requireMembership } from "@/lib/auth";
import { RELEVANCE_PRESETS } from "@citepath/shared";
import { getEntitlements } from "@/lib/entitlements";

export async function GET() {
  try {
    const { user, membership, workspace } = await requireMembership();
    const entitlements = await getEntitlements(workspace.id);
    const settings = workspace.settings;
    const members =
      membership.role === "OWNER" || membership.role === "ADMIN"
        ? await prisma.membership.findMany({
            where: { workspaceId: workspace.id },
            include: { user: { select: { id: true, email: true, name: true } } },
          })
        : [];

    return Response.json({
      user: { id: user.id, email: user.email, name: user.name },
      membership: { role: membership.role },
      workspace: {
        id: workspace.id,
        name: workspace.name,
        mode: workspace.mode,
      },
      settings,
      entitlements,
      members,
      relevancePresets: RELEVANCE_PRESETS,
    });
  } catch (err) {
    return jsonError(err);
  }
}

export async function PATCH(req: Request) {
  try {
    const { workspace } = await requireMembership();
    const data = z
      .object({
        relevanceThreshold: z.number().min(0).max(1).optional(),
        relevancePreset: z.enum(["strict", "balanced", "lenient"]).optional(),
        notifyDraftReady: z.boolean().optional(),
        notifyOpportunity: z.boolean().optional(),
        notifyMention: z.boolean().optional(),
        notifyPublish: z.boolean().optional(),
        notifyBilling: z.boolean().optional(),
        extensionPush: z.boolean().optional(),
        workspaceName: z.string().min(1).optional(),
      })
      .parse(await req.json());

    const threshold =
      data.relevanceThreshold ??
      (data.relevancePreset ? RELEVANCE_PRESETS[data.relevancePreset] : undefined);

    if (data.workspaceName) {
      await prisma.workspace.update({
        where: { id: workspace.id },
        data: { name: data.workspaceName },
      });
    }

    const settings = await prisma.workspaceSettings.upsert({
      where: { workspaceId: workspace.id },
      create: {
        workspaceId: workspace.id,
        relevanceThreshold: threshold ?? 0.5,
        notifyDraftReady: data.notifyDraftReady ?? true,
        notifyOpportunity: data.notifyOpportunity ?? true,
        notifyMention: data.notifyMention ?? true,
        notifyPublish: data.notifyPublish ?? true,
        notifyBilling: data.notifyBilling ?? true,
        extensionPush: data.extensionPush ?? true,
      },
      update: {
        relevanceThreshold: threshold,
        notifyDraftReady: data.notifyDraftReady,
        notifyOpportunity: data.notifyOpportunity,
        notifyMention: data.notifyMention,
        notifyPublish: data.notifyPublish,
        notifyBilling: data.notifyBilling,
        extensionPush: data.extensionPush,
      },
    });

    return Response.json({ settings });
  } catch (err) {
    return jsonError(err);
  }
}
