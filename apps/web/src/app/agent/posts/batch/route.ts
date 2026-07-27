import { NextRequest } from "next/server";
import { CREDIT_COST, redditJson, withAgent } from "@/lib/agent-api";

export async function GET(req: NextRequest) {
  const ids = (new URL(req.url).searchParams.get("ids") ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 25);
  return withAgent(req, CREDIT_COST.heavy, async () => {
    if (!ids.length) return [];
    const names = ids.map((id) => (id.startsWith("t3_") ? id : `t3_${id}`)).join(",");
    const json = await redditJson(`/api/info.json?id=${encodeURIComponent(names)}`);
    if (!json?.data?.children) {
      return ids.map((id) => ({ id, title: `[Demo] post ${id}`, isDemo: true }));
    }
    return json.data.children.map((c: { data: Record<string, unknown> }) => c.data);
  });
}
