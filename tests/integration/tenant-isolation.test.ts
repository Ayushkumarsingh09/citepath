import { describe, expect, it } from "vitest";
import bcrypt from "bcryptjs";
import { prisma } from "@citepath/db";

describe("tenant isolation", () => {
  it("scopes campaigns by workspaceId", async () => {
    const suffix = Date.now();
    const passwordHash = await bcrypt.hash("test-pass-12345", 10);

    const userA = await prisma.user.create({
      data: {
        email: `a-${suffix}@test.local`,
        name: "A",
        passwordHash,
        memberships: {
          create: {
            role: "OWNER",
            workspace: {
              create: {
                name: `ws-a-${suffix}`,
                mode: "SOLO",
                settings: { create: {} },
                subscription: { create: { plan: "TRIAL", status: "TRIALING" } },
              },
            },
          },
        },
      },
      include: { memberships: true },
    });
    const userB = await prisma.user.create({
      data: {
        email: `b-${suffix}@test.local`,
        name: "B",
        passwordHash,
        memberships: {
          create: {
            role: "OWNER",
            workspace: {
              create: {
                name: `ws-b-${suffix}`,
                mode: "SOLO",
                settings: { create: {} },
                subscription: { create: { plan: "TRIAL", status: "TRIALING" } },
              },
            },
          },
        },
      },
      include: { memberships: true },
    });

    const wsA = userA.memberships[0]!.workspaceId;
    const wsB = userB.memberships[0]!.workspaceId;

    await prisma.campaign.create({ data: { workspaceId: wsA, name: "Secret A" } });
    await prisma.campaign.create({ data: { workspaceId: wsB, name: "Secret B" } });

    const aOnly = await prisma.campaign.findMany({ where: { workspaceId: wsA } });
    const bOnly = await prisma.campaign.findMany({ where: { workspaceId: wsB } });

    expect(aOnly.every((c) => c.workspaceId === wsA)).toBe(true);
    expect(bOnly.every((c) => c.workspaceId === wsB)).toBe(true);
    expect(aOnly.some((c) => c.name === "Secret B")).toBe(false);
    expect(bOnly.some((c) => c.name === "Secret A")).toBe(false);

    await prisma.campaign.deleteMany({ where: { workspaceId: { in: [wsA, wsB] } } });
    await prisma.membership.deleteMany({ where: { workspaceId: { in: [wsA, wsB] } } });
    await prisma.workspaceSettings.deleteMany({ where: { workspaceId: { in: [wsA, wsB] } } });
    await prisma.subscription.deleteMany({ where: { workspaceId: { in: [wsA, wsB] } } });
    await prisma.workspace.deleteMany({ where: { id: { in: [wsA, wsB] } } });
    await prisma.user.deleteMany({ where: { id: { in: [userA.id, userB.id] } } });
  }, 30_000);
});
