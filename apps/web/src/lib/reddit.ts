export type NormalizedPost = {
  externalId: string;
  subreddit: string;
  title: string;
  body: string | null;
  author: string | null;
  url: string;
  permalink: string;
  score: number;
  numComments: number;
  createdUtc: Date;
  isDemo: boolean;
};

const UA = process.env.REDDIT_USER_AGENT ?? "CitePath/0.1 (local-dev)";

/** Lookup public Reddit user profile — no password/OAuth required for public data. */
export async function lookupRedditUser(username: string) {
  const clean = username.replace(/^u\//i, "").trim();
  try {
    const res = await fetch(`https://www.reddit.com/user/${encodeURIComponent(clean)}/about.json`, {
      headers: { "User-Agent": UA },
      next: { revalidate: 300 },
    });
    if (!res.ok) {
      if (process.env.DEMO_MODE === "true") {
        return {
          username: clean,
          karma: 42,
          accountAgeDays: 120,
          verifiedEmail: true,
          isMod: false,
          isDemo: true,
        };
      }
      throw new Error(`Reddit user lookup failed (${res.status})`);
    }
    const json = (await res.json()) as {
      data: {
        name: string;
        total_karma?: number;
        link_karma?: number;
        comment_karma?: number;
        created_utc: number;
        has_verified_email?: boolean;
        is_mod?: boolean;
      };
    };
    const d = json.data;
    const karma = d.total_karma ?? (d.link_karma ?? 0) + (d.comment_karma ?? 0);
    const ageDays = Math.floor((Date.now() / 1000 - d.created_utc) / 86400);
    return {
      username: d.name,
      karma,
      accountAgeDays: ageDays,
      verifiedEmail: Boolean(d.has_verified_email),
      isMod: Boolean(d.is_mod),
      isDemo: false,
    };
  } catch (err) {
    if (process.env.DEMO_MODE === "true") {
      return {
        username: clean,
        karma: 42,
        accountAgeDays: 120,
        verifiedEmail: true,
        isMod: false,
        isDemo: true,
      };
    }
    throw err;
  }
}

export async function fetchSubredditPosts(subreddit: string, limit = 25): Promise<NormalizedPost[]> {
  const name = subreddit.replace(/^r\//i, "");
  try {
    const res = await fetch(
      `https://www.reddit.com/r/${encodeURIComponent(name)}/new.json?limit=${limit}`,
      { headers: { "User-Agent": UA }, next: { revalidate: 60 } },
    );
    if (!res.ok) {
      if (process.env.DEMO_MODE === "true") return demoPosts(name);
      throw new Error(`Subreddit fetch failed (${res.status})`);
    }
    const json = (await res.json()) as {
      data: { children: Array<{ data: Record<string, unknown> }> };
    };
    return json.data.children.map((c) => {
      const d = c.data;
      const id = String(d.name ?? d.id);
      const permalink = String(d.permalink ?? "");
      return {
        externalId: id,
        subreddit: name,
        title: String(d.title ?? ""),
        body: d.selftext ? String(d.selftext) : null,
        author: d.author ? String(d.author) : null,
        url: d.url ? String(d.url) : `https://www.reddit.com${permalink}`,
        permalink: permalink.startsWith("http") ? permalink : `https://www.reddit.com${permalink}`,
        score: Number(d.score ?? 0),
        numComments: Number(d.num_comments ?? 0),
        createdUtc: new Date(Number(d.created_utc ?? Date.now() / 1000) * 1000),
        isDemo: false,
      };
    });
  } catch {
    if (process.env.DEMO_MODE === "true") return demoPosts(name);
    throw new Error(`Failed to fetch r/${name}`);
  }
}

function demoPosts(subreddit: string): NormalizedPost[] {
  const now = Date.now();
  return [
    {
      externalId: `demo_${subreddit}_1`,
      subreddit,
      title: `Looking for recommendations for tools in ${subreddit}`,
      body: "Anyone have suggestions for something that helps with growth and visibility? Prefer something that integrates well.",
      author: "demo_user",
      url: `https://www.reddit.com/r/${subreddit}/comments/demo1`,
      permalink: `https://www.reddit.com/r/${subreddit}/comments/demo1`,
      score: 24,
      numComments: 11,
      createdUtc: new Date(now - 3_600_000),
      isDemo: true,
    },
    {
      externalId: `demo_${subreddit}_2`,
      subreddit,
      title: `What's the best alternative you've used recently?`,
      body: "Our current stack is falling short. Open to suggestions that are actually helpful — not spam.",
      author: "demo_user_2",
      url: `https://www.reddit.com/r/${subreddit}/comments/demo2`,
      permalink: `https://www.reddit.com/r/${subreddit}/comments/demo2`,
      score: 58,
      numComments: 33,
      createdUtc: new Date(now - 8_000_000),
      isDemo: true,
    },
    {
      externalId: `demo_${subreddit}_3`,
      subreddit,
      title: `How do you track brand mentions across communities?`,
      body: "Curious what people use for monitoring discussions and responding thoughtfully.",
      author: "demo_user_3",
      url: `https://www.reddit.com/r/${subreddit}/comments/demo3`,
      permalink: `https://www.reddit.com/r/${subreddit}/comments/demo3`,
      score: 12,
      numComments: 7,
      createdUtc: new Date(now - 20_000_000),
      isDemo: true,
    },
  ];
}
