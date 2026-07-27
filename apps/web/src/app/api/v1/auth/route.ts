import { z } from "zod";
import { prisma, WorkspaceMode } from "@citepath/db";
import {
  createSession,
  destroySession,
  getSessionUser,
  hashPassword,
  jsonError,
  verifyPassword,
} from "@/lib/auth";
import { clientIp, rateLimit, rateLimitResponse } from "@/lib/rate-limit";
import { writeAudit } from "@/lib/audit";

export async function POST(req: Request) {
  try {
    const ip = clientIp(req);
    const rl = rateLimit(`auth:${ip}`, 30, 60_000);
    if (!rl.ok) return rateLimitResponse(rl.retryAfterMs);

    const body = await req.json();
    const action = body.action as string;

    if (action === "register") {
      const regRl = rateLimit(`auth:register:${ip}`, 5, 60 * 60_000);
      if (!regRl.ok) return rateLimitResponse(regRl.retryAfterMs);

      const data = z
        .object({
          email: z.string().email(),
          password: z.string().min(8),
          name: z.string().min(1),
          workspaceName: z.string().min(1).optional(),
          mode: z.enum(["SOLO", "TEAM"]).default("SOLO"),
        })
        .parse(body);

      const existing = await prisma.user.findUnique({ where: { email: data.email.toLowerCase() } });
      if (existing) {
        return Response.json(
          { error: { code: "EMAIL_TAKEN", message: "Email already registered", details: {} } },
          { status: 409 },
        );
      }

      const passwordHash = await hashPassword(data.password);
      const trialEndsAt = new Date(Date.now() + 14 * 86_400_000);

      const user = await prisma.user.create({
        data: {
          email: data.email.toLowerCase(),
          name: data.name,
          passwordHash,
          memberships: {
            create: {
              role: "OWNER",
              workspace: {
                create: {
                  name: data.workspaceName ?? `${data.name}'s workspace`,
                  mode: data.mode as WorkspaceMode,
                  settings: { create: {} },
                  subscription: {
                    create: {
                      plan: "TRIAL",
                      status: "TRIALING",
                      trialEndsAt,
                    },
                  },
                },
              },
            },
          },
        },
        include: { memberships: true },
      });

      await createSession(user.id);
      await writeAudit({
        workspaceId: user.memberships[0]?.workspaceId,
        userId: user.id,
        action: "auth.register",
        entityType: "User",
        entityId: user.id,
      });
      return Response.json({
        user: { id: user.id, email: user.email, name: user.name },
        workspaceId: user.memberships[0]?.workspaceId,
        onboardingRequired: true,
      });
    }

    if (action === "login") {
      const loginRl = rateLimit(`auth:login:${ip}`, 20, 60_000);
      if (!loginRl.ok) return rateLimitResponse(loginRl.retryAfterMs);

      const data = z
        .object({ email: z.string().email(), password: z.string().min(1) })
        .parse(body);
      const user = await prisma.user.findUnique({ where: { email: data.email.toLowerCase() } });
      if (!user || !(await verifyPassword(data.password, user.passwordHash))) {
        return Response.json(
          { error: { code: "INVALID_CREDENTIALS", message: "Invalid email or password", details: {} } },
          { status: 401 },
        );
      }
      await createSession(user.id);
      await writeAudit({
        userId: user.id,
        action: "auth.login",
        entityType: "User",
        entityId: user.id,
        meta: { ip },
      });
      return Response.json({ user: { id: user.id, email: user.email, name: user.name } });
    }

    if (action === "logout") {
      await destroySession();
      return Response.json({ ok: true });
    }

    return Response.json(
      { error: { code: "BAD_REQUEST", message: "Unknown action", details: {} } },
      { status: 400 },
    );
  } catch (err) {
    return jsonError(err);
  }
}

export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user) return Response.json({ user: null });
    return Response.json({ user: { id: user.id, email: user.email, name: user.name } });
  } catch (err) {
    return jsonError(err);
  }
}
