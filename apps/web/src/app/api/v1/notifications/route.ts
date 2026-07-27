import { prisma } from "@citepath/db";
import { jsonError, requireMembership } from "@/lib/auth";
import { z } from "zod";

export async function GET() {
  try {
    const { user, workspace } = await requireMembership();
    const notifications = await prisma.notification.findMany({
      where: { workspaceId: workspace.id, userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 50,
    });
    return Response.json({
      notifications,
      unread: notifications.filter((n) => !n.readAt).length,
    });
  } catch (err) {
    return jsonError(err);
  }
}

export async function PATCH(req: Request) {
  try {
    const { user, workspace } = await requireMembership();
    const data = z
      .object({ id: z.string().optional(), markAll: z.boolean().optional() })
      .parse(await req.json());
    if (data.markAll) {
      await prisma.notification.updateMany({
        where: { workspaceId: workspace.id, userId: user.id, readAt: null },
        data: { readAt: new Date() },
      });
    } else if (data.id) {
      await prisma.notification.updateMany({
        where: { id: data.id, userId: user.id, workspaceId: workspace.id },
        data: { readAt: new Date() },
      });
    }
    return Response.json({ ok: true });
  } catch (err) {
    return jsonError(err);
  }
}
