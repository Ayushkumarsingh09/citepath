import { createHash, randomBytes } from "crypto";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { prisma, MemberRole } from "@citepath/db";
import { AppError } from "@citepath/shared";

const SESSION_COOKIE = "citepath_session";
const SESSION_DAYS = 30;

export function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export async function createSession(userId: string, meta?: { userAgent?: string; ip?: string }) {
  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 86_400_000);
  await prisma.session.create({
    data: {
      tokenHash: hashToken(token),
      userId,
      expiresAt,
      userAgent: meta?.userAgent,
      ip: meta?.ip,
    },
  });
  const jar = await cookies();
  const secure =
    process.env.COOKIE_SECURE === "true" ||
    (process.env.NODE_ENV === "production" && (process.env.APP_URL ?? "").startsWith("https"));
  jar.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure,
    path: "/",
    expires: expiresAt,
  });
  return token;
}

export async function destroySession() {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (token) {
    await prisma.session.updateMany({
      where: { tokenHash: hashToken(token), revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }
  jar.delete(SESSION_COOKIE);
}

export async function getSessionUser() {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const session = await prisma.session.findFirst({
    where: {
      tokenHash: hashToken(token),
      revokedAt: null,
      expiresAt: { gt: new Date() },
    },
    include: { user: true },
  });
  if (!session) return null;
  return session.user;
}

export async function requireUser() {
  const user = await getSessionUser();
  if (!user) throw new AppError("UNAUTHORIZED", "Authentication required", 401);
  return user;
}

export async function getActiveMembership(userId: string, workspaceId?: string) {
  if (workspaceId) {
    return prisma.membership.findUnique({
      where: { workspaceId_userId: { workspaceId, userId } },
      include: { workspace: { include: { subscription: true, settings: true } } },
    });
  }
  return prisma.membership.findFirst({
    where: { userId },
    orderBy: { createdAt: "asc" },
    include: { workspace: { include: { subscription: true, settings: true } } },
  });
}

export async function requireMembership(roles?: MemberRole[]) {
  const user = await requireUser();
  const jar = await cookies();
  const workspaceId = jar.get("citepath_workspace")?.value;
  const membership = await getActiveMembership(user.id, workspaceId);
  if (!membership) throw new AppError("NO_WORKSPACE", "No workspace found", 403);
  if (roles && !roles.includes(membership.role)) {
    throw new AppError("FORBIDDEN", "Insufficient permissions", 403);
  }
  return { user, membership, workspace: membership.workspace };
}

export function jsonError(err: unknown) {
  if (err instanceof AppError) {
    return Response.json(
      { error: { code: err.code, message: err.message, details: err.details } },
      { status: err.status },
    );
  }
  console.error(err);
  return Response.json(
    { error: { code: "INTERNAL", message: "Something went wrong", details: {} } },
    { status: 500 },
  );
}
