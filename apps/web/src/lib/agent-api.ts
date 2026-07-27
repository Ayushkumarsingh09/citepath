import { NextRequest } from "next/server";
import { createHash } from "crypto";
import { prisma } from "@citepath/db";

export const CREDIT_COST = {
  lookup: 1,
  list: 2,
  search: 3,
  heavy: 5,
} as const;

export type AgentKey = {
  id: string;
  workspaceId: string;
  name: string;
  creditsLimit: number;
  creditsUsed: number;
};

const UA = process.env.REDDIT_USER_AGENT ?? "CitePath/0.1 (agent-api)";

export async function requireAgentKey(req: NextRequest): Promise<AgentKey | Response> {
  const key = req.headers.get("x-api-key");
  if (!key?.startsWith("cp_")) {
    return Response.json(
      { error: { code: "UNAUTHORIZED", message: "Invalid API key", details: {} } },
      { status: 401 },
    );
  }
  const hash = createHash("sha256").update(key).digest("hex");
  const record = await prisma.apiKey.findFirst({ where: { keyHash: hash, revokedAt: null } });
  if (!record) {
    return Response.json(
      { error: { code: "UNAUTHORIZED", message: "Invalid API key", details: {} } },
      { status: 401 },
    );
  }
  return {
    id: record.id,
    workspaceId: record.workspaceId,
    name: record.name,
    creditsLimit: record.creditsLimit,
    creditsUsed: record.creditsUsed,
  };
}

export function isAgentKey(v: AgentKey | Response): v is AgentKey {
  return !(v instanceof Response);
}

export async function chargeCredits(key: AgentKey, cost: number) {
  if (key.creditsUsed + cost > key.creditsLimit) {
    return Response.json(
      { error: { code: "CREDIT_LIMIT", message: "Credit limit exceeded", details: {} } },
      { status: 429 },
    );
  }
  const updated = await prisma.apiKey.update({
    where: { id: key.id },
    data: { creditsUsed: { increment: cost }, lastUsedAt: new Date() },
  });
  return {
    used: cost,
    remaining: updated.creditsLimit - updated.creditsUsed,
    limit: updated.creditsLimit,
  };
}

export function isCreditError(
  v: { used: number; remaining: number; limit: number } | Response,
): v is Response {
  return v instanceof Response;
}

export function jsonOk(
  data: unknown,
  credits: { used: number; remaining: number; limit: number },
  status = 200,
) {
  return Response.json(data, {
    status,
    headers: {
      "X-Credits-Used": String(credits.used),
      "X-Credits-Remaining": String(credits.remaining),
      "X-Credits-Limit": String(credits.limit),
    },
  });
}

export async function redditJson(path: string) {
  const url = path.startsWith("http") ? path : `https://www.reddit.com${path}`;
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": UA },
      next: { revalidate: 60 },
    });
    if (!res.ok) throw new Error(`Reddit ${res.status}`);
    return await res.json();
  } catch (err) {
    if (process.env.DEMO_MODE === "true") return null;
    throw err;
  }
}

export async function withAgent(
  req: NextRequest,
  cost: number,
  handler: (key: AgentKey) => Promise<unknown>,
) {
  const { clientIp, rateLimit, rateLimitResponse } = await import("./rate-limit");
  const ip = clientIp(req);
  const rl = rateLimit(`agent:${ip}`, 120, 60_000);
  if (!rl.ok) return rateLimitResponse(rl.retryAfterMs);

  const keyOrErr = await requireAgentKey(req);
  if (!isAgentKey(keyOrErr)) return keyOrErr;

  const keyRl = rateLimit(`agent:key:${keyOrErr.id}`, 60, 60_000);
  if (!keyRl.ok) return rateLimitResponse(keyRl.retryAfterMs);

  const charged = await chargeCredits(keyOrErr, cost);
  if (isCreditError(charged)) return charged;
  try {
    const data = await handler(keyOrErr);
    return jsonOk(data, charged);
  } catch (err) {
    console.error(err);
    return Response.json(
      { error: { code: "INTERNAL", message: "Upstream request failed", details: {} } },
      { status: 500 },
    );
  }
}
