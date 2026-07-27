import { NextRequest } from "next/server";
import { CREDIT_COST, redditJson, withAgent } from "@/lib/agent-api";

export async function GET(req: NextRequest, ctx: { params: Promise<{ username: string }> }) {
  const { username } = await ctx.params;
  const limit = Math.min(100, Number(new URL(req.url).searchParams.get("limit") ?? 25));
  return withAgent(req, CREDIT_COST.list, async () => {
    const json = await redditJson(
      `/user/${encodeURIComponent(username)}/comments.json?limit=${limit}`,
    );
    if (!json?.data?.children) {
      return [{ id: "demo", body: `[Demo] comment by ${username}`, isDemo: true }];
    }
    return json.data.children.map((c: { data: Record<string, unknown> }) => c.data);
  });
}
