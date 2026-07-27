import { prisma } from "@citepath/db";
import { createHash, randomBytes } from "crypto";
import { jsonError, requireMembership } from "@/lib/auth";
import { writeAudit } from "@/lib/audit";

function hashKey(raw: string) {
  return createHash("sha256").update(raw).digest("hex");
}

function newRawKey() {
  const secret = randomBytes(24).toString("hex");
  const raw = `cp_${secret}`;
  return { raw, prefix: raw.slice(0, 10), hash: hashKey(raw) };
}

function nextCreditReset() {
  const reset = new Date();
  reset.setUTCDate(1);
  reset.setUTCMonth(reset.getUTCMonth() + 1);
  reset.setUTCHours(0, 0, 0, 0);
  return reset;
}

export async function GET() {
  try {
    const { workspace } = await requireMembership();
    const keys = await prisma.apiKey.findMany({
      where: { workspaceId: workspace.id, revokedAt: null },
      select: {
        id: true,
        name: true,
        keyPrefix: true,
        creditsLimit: true,
        creditsUsed: true,
        creditsResetAt: true,
        lastUsedAt: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });
    return Response.json({ keys });
  } catch (err) {
    return jsonError(err);
  }
}

export async function POST(req: Request) {
  try {
    const { user, workspace } = await requireMembership();
    const body = await req.json();

    if (body.action === "rotate") {
      const id = String(body.id ?? "");
      const existing = await prisma.apiKey.findFirst({
        where: { id, workspaceId: workspace.id, revokedAt: null },
      });
      if (!existing) {
        return Response.json(
          { error: { code: "NOT_FOUND", message: "API key not found", details: {} } },
          { status: 404 },
        );
      }
      const { raw, prefix, hash } = newRawKey();
      const [, created] = await prisma.$transaction([
        prisma.apiKey.update({
          where: { id: existing.id },
          data: { revokedAt: new Date() },
        }),
        prisma.apiKey.create({
          data: {
            workspaceId: workspace.id,
            name: existing.name,
            keyPrefix: prefix,
            keyHash: hash,
            creditsLimit: existing.creditsLimit,
            creditsUsed: existing.creditsUsed,
            creditsResetAt: existing.creditsResetAt,
          },
        }),
      ]);
      await writeAudit({
        workspaceId: workspace.id,
        userId: user.id,
        action: "api_key.rotate",
        entityType: "ApiKey",
        entityId: created.id,
        meta: { revokedId: existing.id },
      });
      return Response.json({
        key: { id: created.id, name: created.name, keyPrefix: created.keyPrefix, secret: raw },
        revokedId: existing.id,
      });
    }

    const name = String(body.name ?? "Default");
    const { raw, prefix, hash } = newRawKey();
    const key = await prisma.apiKey.create({
      data: {
        workspaceId: workspace.id,
        name,
        keyPrefix: prefix,
        keyHash: hash,
        creditsLimit: 50,
        creditsUsed: 0,
        creditsResetAt: nextCreditReset(),
      },
    });
    await writeAudit({
      workspaceId: workspace.id,
      userId: user.id,
      action: "api_key.create",
      entityType: "ApiKey",
      entityId: key.id,
    });
    return Response.json({
      key: { id: key.id, name: key.name, keyPrefix: key.keyPrefix, secret: raw },
    });
  } catch (err) {
    return jsonError(err);
  }
}

export async function DELETE(req: Request) {
  try {
    const { user, workspace } = await requireMembership();
    const { id } = await req.json();
    const result = await prisma.apiKey.updateMany({
      where: { id, workspaceId: workspace.id, revokedAt: null },
      data: { revokedAt: new Date() },
    });
    if (!result.count) {
      return Response.json(
        { error: { code: "NOT_FOUND", message: "API key not found", details: {} } },
        { status: 404 },
      );
    }
    await writeAudit({
      workspaceId: workspace.id,
      userId: user.id,
      action: "api_key.revoke",
      entityType: "ApiKey",
      entityId: id,
    });
    return Response.json({ ok: true });
  } catch (err) {
    return jsonError(err);
  }
}
