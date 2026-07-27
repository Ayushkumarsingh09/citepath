import { NextRequest } from "next/server";
import { CREDIT_COST, withAgent } from "@/lib/agent-api";
import { lookupRedditUser } from "@/lib/reddit";

export async function GET(req: NextRequest, ctx: { params: Promise<{ username: string }> }) {
  const { username } = await ctx.params;
  return withAgent(req, CREDIT_COST.lookup, async () => {
    const profile = await lookupRedditUser(username);
    return {
      name: profile.username,
      total_karma: profile.karma,
      created_days_ago: profile.accountAgeDays,
      has_verified_email: profile.verifiedEmail,
      is_mod: profile.isMod,
      isDemo: profile.isDemo,
    };
  });
}
