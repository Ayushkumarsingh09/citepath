import { NextRequest } from "next/server";
import { CREDIT_COST, withAgent } from "@/lib/agent-api";
import { fetchSubredditPosts } from "@/lib/reddit";

export async function GET(req: NextRequest, ctx: { params: Promise<{ name: string }> }) {
  const { name } = await ctx.params;
  const url = new URL(req.url);
  const limit = Math.min(100, Number(url.searchParams.get("limit") ?? 25));
  const sort = url.searchParams.get("sort") ?? "new";
  return withAgent(req, CREDIT_COST.list, async () => {
    // fetchSubredditPosts uses /new; for other sorts hit reddit directly when possible
    const posts = await fetchSubredditPosts(name, limit);
    return posts.map((p) => ({
      id: p.externalId.replace(/^t3_/, ""),
      title: p.title,
      selftext: p.body,
      author: p.author,
      created_utc: Math.floor(p.createdUtc.getTime() / 1000),
      url: p.url,
      permalink: p.permalink,
      subreddit: p.subreddit,
      score: p.score,
      num_comments: p.numComments,
      is_self: Boolean(p.body),
      isDemo: p.isDemo,
      sort,
    }));
  });
}
