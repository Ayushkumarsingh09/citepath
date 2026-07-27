import { NextRequest } from "next/server";
import { CREDIT_COST, redditJson, withAgent } from "@/lib/agent-api";

export async function GET(req: NextRequest, ctx: { params: Promise<{ name: string }> }) {
  const { name } = await ctx.params;
  return withAgent(req, CREDIT_COST.lookup, async () => {
    const json = await redditJson(`/r/${encodeURIComponent(name)}/about/traffic.json`);
    if (!json) {
      return {
        day: [[Math.floor(Date.now() / 1000), 100, 50]],
        hour: [],
        month: [],
        isDemo: true,
      };
    }
    return json;
  });
}
