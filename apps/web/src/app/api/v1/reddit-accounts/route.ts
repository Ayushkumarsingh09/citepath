import { z } from "zod";
import { prisma } from "@citepath/db";
import { jsonError, requireMembership } from "@/lib/auth";
import { assertAccountCapacity } from "@/lib/entitlements";
import { lookupRedditUser } from "@/lib/reddit";
import { isInWarmup, karmaMilestone, promotionalRatio } from "@citepath/shared";

export async function GET() {
  try {
    const { workspace } = await requireMembership();
    const accounts = await prisma.redditAccount.findMany({
      where: { workspaceId: workspace.id },
      include: { advocate: { select: { id: true, name: true, campaignId: true } } },
      orderBy: { createdAt: "desc" },
    });
    return Response.json({
      accounts: accounts.map((a) => ({
        ...a,
        promotionalRatio: promotionalRatio(a.karma),
        milestone: karmaMilestone(a.karma),
        inWarmup: isInWarmup(a.karma),
      })),
    });
  } catch (err) {
    return jsonError(err);
  }
}

export async function POST(req: Request) {
  try {
    const { workspace } = await requireMembership();
    await assertAccountCapacity(workspace.id);
    const data = z.object({ username: z.string().min(1) }).parse(await req.json());
    const profile = await lookupRedditUser(data.username);

    const account = await prisma.redditAccount.upsert({
      where: {
        workspaceId_username: { workspaceId: workspace.id, username: profile.username },
      },
      create: {
        workspaceId: workspace.id,
        username: profile.username,
        karma: profile.karma,
        accountAgeDays: profile.accountAgeDays,
        verifiedEmail: profile.verifiedEmail,
        isMod: profile.isMod,
        lastSyncedAt: new Date(),
      },
      update: {
        karma: profile.karma,
        accountAgeDays: profile.accountAgeDays,
        verifiedEmail: profile.verifiedEmail,
        isMod: profile.isMod,
        lastSyncedAt: new Date(),
      },
    });

    return Response.json({ account, isDemo: profile.isDemo }, { status: 201 });
  } catch (err) {
    return jsonError(err);
  }
}
