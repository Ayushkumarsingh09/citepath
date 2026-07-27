import { NextRequest } from "next/server";
import { CREDIT_COST, redditJson, withAgent } from "@/lib/agent-api";

export async function GET(req: NextRequest) {
  return withAgent(req, CREDIT_COST.search, async () => {
    const q = new URL(req.url).searchParams.get("q") ?? "";
    const json = await redditJson(`/subreddits/search.json?q=${encodeURIComponent(q)}&limit=25`);
    if (!json) {
      return [
        {
          display_name: q || "saas",
          subscribers: 1000,
          created_utc: 1700000000,
          public_description: `[Demo] Match for ${q}`,
          over18: false,
          subreddit_type: "public",
          isDemo: true,
        },
      ];
    }
    return (json.data?.children ?? []).map((c: { data: Record<string, unknown> }) => {
      const d = c.data;
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
  });
}
