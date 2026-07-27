import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const email = "demo@citepath.local";
  const passwordHash = await bcrypt.hash("demo-demo-demo", 12);
  const trialEndsAt = new Date(Date.now() + 14 * 86_400_000);

  let user = await prisma.user.findUnique({
    where: { email },
    include: { memberships: true },
  });

  if (!user) {
    user = await prisma.user.create({
      data: {
        email,
        name: "Demo User",
        passwordHash,
        memberships: {
          create: {
            role: "OWNER",
            workspace: {
              create: {
                name: "Demo Workspace",
                mode: "SOLO",
                settings: { create: { relevanceThreshold: 0.5 } },
                subscription: {
                  create: { plan: "TRIAL", status: "TRIALING", trialEndsAt },
                },
              },
            },
          },
        },
      },
      include: { memberships: true },
    });
  }

  const workspaceId = user.memberships[0]?.workspaceId;
  if (!workspaceId) throw new Error("No workspace");

  const existing = await prisma.campaign.findFirst({
    where: { workspaceId, name: "CitePath Demo" },
  });
  if (!existing) {
    await prisma.campaign.create({
      data: {
        workspaceId,
        name: "CitePath Demo",
        productName: "CitePath",
        productUrl: "https://citepath.local",
        description: "AI citation and Reddit thread discovery",
      },
    });
  }

  console.log("Seeded demo user demo@citepath.local / demo-demo-demo");
  console.log("Workspace", workspaceId);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
