import { NextRequest } from "next/server";
import { CREDIT_COST, redditJson, withAgent } from "@/lib/agent-api";

export async function GET(req: NextRequest, ctx: { params: Promise<{ name: string }> }) {
  const { name } = await ctx.params;
  return withAgent(req, CREDIT_COST.lookup, async () => {
    const json = await redditJson(`/r/${encodeURIComponent(name)}/about/rules.json`);
    if (!json?.rules) {
      return [
        {
          kind: "all",
          short_name: "Be respectful",
          description: `[Demo] Community rules for r/${name}`,
          priority: 1,
          isDemo: true,
        },
      ];
    }
    return json.rules.map((r: Record<string, unknown>) => ({
      kind: r.kind,
      short_name: r.short_name,
      description: r.description,
      violation_reason: r.violation_reason,
      created_utc: r.created_utc,
      priority: r.priority,
    }));
  });
}
