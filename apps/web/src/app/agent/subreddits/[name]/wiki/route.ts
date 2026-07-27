import { NextRequest } from "next/server";
import { CREDIT_COST, redditJson, withAgent } from "@/lib/agent-api";

export async function GET(req: NextRequest, ctx: { params: Promise<{ name: string }> }) {
  const { name } = await ctx.params;
  return withAgent(req, CREDIT_COST.heavy, async () => {
    const json = await redditJson(`/r/${encodeURIComponent(name)}/wiki/pages.json`);
    if (!json?.data) return ["index", "rules", "faq"];
    return json.data;
  });
}
