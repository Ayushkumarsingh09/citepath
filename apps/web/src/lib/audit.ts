import { prisma, Prisma } from "@citepath/db";

export async function writeAudit(input: {
  workspaceId?: string | null;
  userId?: string | null;
  action: string;
  entityType?: string;
  entityId?: string;
  meta?: Prisma.InputJsonValue;
}) {
  try {
    await prisma.auditLog.create({
      data: {
        workspaceId: input.workspaceId ?? null,
        userId: input.userId ?? null,
        action: input.action,
        entityType: input.entityType,
        entityId: input.entityId,
        metaJson: input.meta ?? {},
      },
    });
  } catch (err) {
    console.error("[audit] failed", err);
  }
}
