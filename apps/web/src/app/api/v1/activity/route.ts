import { prisma } from "@citepath/db";
import { jsonError, requireMembership } from "@/lib/auth";

export async function GET() {
  try {
    const { workspace } = await requireMembership();
    const activity = await prisma.extensionActivity.findMany({
      where: { workspaceId: workspace.id },
      orderBy: { createdAt: "desc" },
      take: 50,
      include: { user: { select: { email: true, name: true } } },
    });
    return Response.json({ activity });
  } catch (err) {
    return jsonError(err);
  }
}
