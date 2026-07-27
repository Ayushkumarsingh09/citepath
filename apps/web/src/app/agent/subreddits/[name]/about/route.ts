import { NextRequest } from "next/server";
import { CREDIT_COST, redditJson, withAgent } from "@/lib/agent-api";

export async function GET(req: NextRequest, ctx: { params: Promise<{ name: string }> }) {
  const { name } = await ctx.params;
  return withAgent(req, CREDIT_COST.lookup, async () => {
    const json = await redditJson(`/r/${encodeURIComponent(name)}/about.json`);
    if (!json?.data) {
      return {
        display_name: name,
        subscribers: 0,
        public_description: `[Demo] about r/${name}`,
        isDemo: true,
      };
    }
    const d = json.data;
    return {
      display_name: d.display_name,
      subscribers: d.subscribers,
      created_utc: d.created_utc,
      public_description: d.public_description,
      description: d.description,
      submit_text: d.submit_text,
      over18: d.over18,
      subreddit_type: d.subreddit_type,
      active_user_count: d.active_user_count,
      submission_type: d.submission_type,
      allow_images: d.allow_images,
      allow_videos: d.allow_videos,
      allow_polls: d.allow_polls,
      link_flair_enabled: d.link_flair_enabled,
      spoilers_enabled: d.spoilers_enabled,
    };
  });
}
