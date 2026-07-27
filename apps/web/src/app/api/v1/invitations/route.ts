import { createHash, randomBytes } from "crypto";
import { z } from "zod";
import { prisma } from "@citepath/db";
import { jsonError, requireMembership, requireUser } from "@/lib/auth";

function hashToken(t: string) {
  return createHash("sha256").update(t).digest("hex");
}

export async function GET() {
  try {
    const { workspace } = await requireMembership(["OWNER", "ADMIN"]);
    const invitations = await prisma.invitation.findMany({
      where: { workspaceId: workspace.id, status: "PENDING" },
      orderBy: { createdAt: "desc" },
    });
    return Response.json({ invitations });
  } catch (err) {
    return jsonError(err);
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (body.action === "accept") {
      const user = await requireUser();
      const data = z.object({ token: z.string().min(10) }).parse(body);
      const inv = await prisma.invitation.findFirst({
        where: { tokenHash: hashToken(data.token), status: "PENDING", expiresAt: { gt: new Date() } },
      });
      if (!inv) {
        return Response.json(
          { error: { code: "NOT_FOUND", message: "Invitation invalid or expired", details: {} } },
          { status: 404 },
        );
      }
      await prisma.$transaction([
        prisma.membership.upsert({
          where: { workspaceId_userId: { workspaceId: inv.workspaceId, userId: user.id } },
          create: { workspaceId: inv.workspaceId, userId: user.id, role: inv.role },
          update: { role: inv.role },
        }),
        prisma.invitation.update({ where: { id: inv.id }, data: { status: "ACCEPTED" } }),
      ]);
      return Response.json({ ok: true, workspaceId: inv.workspaceId });
    }

    const { user, workspace } = await requireMembership(["OWNER", "ADMIN"]);
    if (body.action === "invite") {
      const data = z
        .object({ email: z.string().email(), role: z.enum(["ADMIN", "MEMBER"]).default("MEMBER") })
        .parse(body);
      const token = randomBytes(24).toString("hex");
      const inv = await prisma.invitation.create({
        data: {
          workspaceId: workspace.id,
          email: data.email.toLowerCase(),
          role: data.role,
          tokenHash: hashToken(token),
          invitedById: user.id,
          expiresAt: new Date(Date.now() + 7 * 86_400_000),
        },
      });
      return Response.json({
        invitation: { id: inv.id, email: inv.email, role: inv.role },
        // shown once for local/dev email-less flow
        acceptToken: token,
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
