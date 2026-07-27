import { prisma } from "@citepath/db";
import { jsonError, requireMembership } from "@/lib/auth";
import { getEntitlements } from "@/lib/entitlements";
import { runWorkspaceScan } from "@/lib/scanner";

export async function GET() {
  try {
    const { workspace } = await requireMembership();
    const runs = await prisma.scanRun.findMany({
      where: { workspaceId: workspace.id },
      orderBy: { createdAt: "desc" },
      take: 10,
    });
    return Response.json({ runs });
  } catch (err) {
    return jsonError(err);
  }
}

export async function POST() {
  try {
    const { workspace } = await requireMembership();
    const entitlements = await getEntitlements(workspace.id);
    if (entitlements.scanningPaused) {
      return Response.json(
        {
          error: {
            code: "SCANNING_PAUSED",
            message: "Scanning paused until you choose a plan",
            details: {},
          },
        },
        { status: 402 },
      );
    }
    const result = await runWorkspaceScan(workspace.id);
    return Response.json(result);
  } catch (err) {
    return jsonError(err);
  }
}
