import { NextRequest } from "next/server";
import { CREDIT_COST, redditJson, withAgent } from "@/lib/agent-api";

export async function GET(req: NextRequest) {
  const q = new URL(req.url).searchParams.get("q") ?? "";
  const limit = Math.min(100, Number(new URL(req.url).searchParams.get("limit") ?? 25));
  return withAgent(req, CREDIT_COST.search, async () => {
    const json = await redditJson(
      `/search.json?q=${encodeURIComponent(q)}&limit=${limit}&type=link`,
    );
    if (!json?.data?.children) {
      return [{ id: "demo", title: `[Demo] Search: ${q}`, isDemo: true }];
    }
    return json.data.children.map((c: { data: Record<string, unknown> }) => {
      const d = c.data;
      return {
        id: d.id,
        title: d.title,
        selftext: d.selftext,
        author: d.author,
        created_utc: d.created_utc,
        url: d.url,
        permalink: d.permalink,
        subreddit: d.subreddit,
        score: d.score,
        num_comments: d.num_comments,
      };
    });
  });
}
