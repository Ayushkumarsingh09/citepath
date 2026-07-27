import { NextRequest } from "next/server";
import { CREDIT_COST, redditJson, withAgent } from "@/lib/agent-api";

export async function GET(req: NextRequest, ctx: { params: Promise<{ name: string }> }) {
  const { name } = await ctx.params;
  return withAgent(req, CREDIT_COST.lookup, async () => {
    const json = await redditJson(`/r/${encodeURIComponent(name)}/api/widgets.json`);
    if (!json) return [{ id: "demo", kind: "textarea", shortName: "About", isDemo: true }];
    return json.items ?? json;
  });
}
