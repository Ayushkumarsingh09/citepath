import { NextRequest } from "next/server";
import { CREDIT_COST, withAgent } from "@/lib/agent-api";

export async function GET(req: NextRequest) {
  return withAgent(req, CREDIT_COST.lookup, async (key) => ({
    workspaceId: key.workspaceId,
    keyName: key.name,
    credits: {
      used: key.creditsUsed + CREDIT_COST.lookup,
      remaining: key.creditsLimit - key.creditsUsed - CREDIT_COST.lookup,
      limit: key.creditsLimit,
    },
    product: "CitePath Agent API",
  }));
}
