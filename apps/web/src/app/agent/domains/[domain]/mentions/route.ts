import { NextRequest } from "next/server";
import { CREDIT_COST, redditJson, withAgent } from "@/lib/agent-api";

export async function GET(req: NextRequest, ctx: { params: Promise<{ domain: string }> }) {
  const { domain } = await ctx.params;
  const limit = Math.min(100, Number(new URL(req.url).searchParams.get("limit") ?? 25));
  return withAgent(req, CREDIT_COST.heavy, async () => {
    const json = await redditJson(
      `/domain/${encodeURIComponent(domain)}.json?limit=${limit}`,
    );
    if (!json?.data?.children) {
      return [
        {
          id: "demo",
          title: `[Demo] Mention of ${domain}`,
          url: `https://${domain}`,
          subreddit: "saas",
          isDemo: true,
        },
      ];
    }
    return json.data.children.map((c: { data: Record<string, unknown> }) => ({
      id: c.data.id,
      title: c.data.title,
      url: c.data.url,
      permalink: c.data.permalink,
      subreddit: c.data.subreddit,
      score: c.data.score,
      author: c.data.author,
      created_utc: c.data.created_utc,
      num_comments: c.data.num_comments,
    }));
  });
}
