import { NextRequest } from "next/server";
import { CREDIT_COST, redditJson, withAgent } from "@/lib/agent-api";

export async function GET(req: NextRequest, ctx: { params: Promise<{ name: string }> }) {
  const { name } = await ctx.params;
  const limit = Math.min(100, Number(new URL(req.url).searchParams.get("limit") ?? 25));
  return withAgent(req, CREDIT_COST.list, async () => {
    const json = await redditJson(`/r/${encodeURIComponent(name)}/comments.json?limit=${limit}`);
    if (!json?.data?.children) {
      return [
        {
          id: "demo1",
          body: `[Demo] Recent comment in r/${name}`,
          author: "demo_user",
          created_utc: Math.floor(Date.now() / 1000),
          score: 5,
          isDemo: true,
        },
      ];
    }
    return json.data.children.map((c: { data: Record<string, unknown> }) => {
      const d = c.data;
      return {
        id: d.id,
        body: d.body,
        author: d.author,
        created_utc: d.created_utc,
        score: d.score,
        permalink: d.permalink,
        link_id: d.link_id,
        parent_id: d.parent_id,
      };
    });
  });
}
