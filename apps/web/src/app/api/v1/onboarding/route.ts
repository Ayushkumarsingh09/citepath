import { cookies } from "next/headers";
import { jsonError, requireMembership, requireUser } from "@/lib/auth";
import { prisma, WorkspaceMode } from "@citepath/db";
import { z } from "zod";

export async function POST(req: Request) {
  try {
    const user = await requireUser();
    const body = await req.json();
    const step = body.step as string;

    if (step === "workspace_mode") {
      const data = z.object({ mode: z.enum(["SOLO", "TEAM"]), name: z.string().min(1) }).parse(body);
      const membership = await prisma.membership.findFirst({
        where: { userId: user.id },
        include: { workspace: true },
      });
      if (!membership) {
        return Response.json(
          { error: { code: "NO_WORKSPACE", message: "Workspace missing", details: {} } },
          { status: 400 },
        );
      }
      // Mode is immutable after first confirmation if already set via a flag — allow set once from default
      await prisma.workspace.update({
        where: { id: membership.workspaceId },
        data: { mode: data.mode as WorkspaceMode, name: data.name },
      });
      const jar = await cookies();
      jar.set("citepath_workspace", membership.workspaceId, { path: "/", sameSite: "lax" });
      jar.set("citepath_onboarding", "1", { path: "/", sameSite: "lax" });
      return Response.json({ ok: true, workspaceId: membership.workspaceId });
    }

    const { workspace } = await requireMembership();

    if (step === "campaign") {
      const data = z
        .object({
          name: z.string().min(1),
          productName: z.string().optional(),
          productUrl: z.string().optional(),
          description: z.string().optional(),
        })
        .parse(body);
      const campaign = await prisma.campaign.create({
        data: {
          workspaceId: workspace.id,
          name: data.name,
          productName: data.productName,
          productUrl: data.productUrl || null,
          description: data.description,
        },
      });
      return Response.json({ campaign });
    }

    if (step === "complete") {
      const jar = await cookies();
      jar.set("citepath_onboarding", "done", { path: "/", sameSite: "lax" });
      return Response.json({ ok: true, redirect: "/dashboard" });
    }

    return Response.json(
      { error: { code: "BAD_REQUEST", message: "Unknown step", details: {} } },
      { status: 400 },
    );
  } catch (err) {
    return jsonError(err);
  }
}
