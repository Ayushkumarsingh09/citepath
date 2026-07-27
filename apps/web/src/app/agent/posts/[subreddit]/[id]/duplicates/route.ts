import { NextRequest } from "next/server";
import { CREDIT_COST, redditJson, withAgent } from "@/lib/agent-api";

export async function GET(
  req: NextRequest,
  ctx: { params: Promise<{ subreddit: string; id: string }> },
) {
  const { subreddit, id } = await ctx.params;
  return withAgent(req, CREDIT_COST.heavy, async () => {
    const json = await redditJson(
      `/duplicates/${encodeURIComponent(id)}.json?limit=10`,
    );
    if (!json?.[1]?.data?.children) {
      return { subreddit, id, duplicates: [], isDemo: true };
    }
    return {
      subreddit,
      id,
      duplicates: json[1].data.children.map((c: { data: Record<string, unknown> }) => c.data),
    };
  });
}
