import { NextRequest } from "next/server";
import { CREDIT_COST, redditJson, withAgent } from "@/lib/agent-api";

export async function GET(
  req: NextRequest,
  ctx: { params: Promise<{ name: string; page: string }> },
) {
  const { name, page } = await ctx.params;
  return withAgent(req, CREDIT_COST.heavy, async () => {
    const json = await redditJson(
      `/r/${encodeURIComponent(name)}/wiki/${encodeURIComponent(page)}.json`,
    );
    if (!json) {
      return {
        kind: "wikipage",
        data: { content_md: `[Demo] Wiki page ${page} for r/${name}`, isDemo: true },
      };
    }
    return json;
  });
}
