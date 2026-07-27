import { NextRequest } from "next/server";
import { CREDIT_COST, redditJson, withAgent } from "@/lib/agent-api";

export async function GET(
  req: NextRequest,
  ctx: { params: Promise<{ subreddit: string; id: string }> },
) {
  const { subreddit, id } = await ctx.params;
  return withAgent(req, CREDIT_COST.list, async () => {
    const json = await redditJson(
      `/r/${encodeURIComponent(subreddit)}/comments/${encodeURIComponent(id)}.json?limit=50`,
    );
    if (!json?.[1]?.data?.children) {
      return [{ id: "demo", body: "[Demo] comment thread", isDemo: true }];
    }
    return json[1].data.children
      .filter((c: { kind: string }) => c.kind === "t1")
      .map((c: { data: Record<string, unknown> }) => ({
        id: c.data.id,
        body: c.data.body,
        author: c.data.author,
        score: c.data.score,
        created_utc: c.data.created_utc,
        permalink: c.data.permalink,
      }));
  });
}
