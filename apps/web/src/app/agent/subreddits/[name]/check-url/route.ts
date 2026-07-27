import { NextRequest } from "next/server";
import { CREDIT_COST, redditJson, withAgent } from "@/lib/agent-api";

export async function GET(req: NextRequest, ctx: { params: Promise<{ name: string }> }) {
  const { name } = await ctx.params;
  const target = new URL(req.url).searchParams.get("url");
  if (!target) {
    return Response.json(
      { error: { code: "BAD_REQUEST", message: "url required", details: {} } },
      { status: 400 },
    );
  }
  return withAgent(req, CREDIT_COST.search, async () => {
    const json = await redditJson(
      `/r/${encodeURIComponent(name)}/search.json?q=url:${encodeURIComponent(target)}&restrict_sr=1&limit=10`,
    );
    const posts = (json?.data?.children ?? []).map((c: { data: Record<string, unknown> }) => c.data);
    return {
      alreadyPosted: posts.length > 0,
      posts: posts.map((d: Record<string, unknown>) => ({
        id: d.id,
        title: d.title,
        url: d.url,
        permalink: d.permalink,
        score: d.score,
        author: d.author,
        created_utc: d.created_utc,
        subreddit: d.subreddit,
      })),
    };
  });
}
