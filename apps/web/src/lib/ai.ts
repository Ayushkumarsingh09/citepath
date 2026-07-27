type GenInput = {
  type: "WARMUP" | "PROMOTIONAL";
  advocate?: {
    name: string;
    tone: string;
    role: string;
    writingGuidelines?: string | null;
    voiceGuidelines?: string | null;
    disclosureRequirements?: string | null;
  } | null;
  campaign: {
    name: string;
    productName?: string | null;
    productUrl?: string | null;
    description?: string | null;
  };
  post: { title: string; body?: string | null; subreddit: string };
  knowledge?: string;
};

export async function generateDraftComment(input: GenInput): Promise<string> {
  const key = process.env.AI_PROVIDER_API_KEY;
  if (!key) return demoDraft(input);

  const system = `You write authentic Reddit comments. Match subreddit tone. Never sound like an ad.
Advocate: ${input.advocate?.name ?? "User"} (${input.advocate?.role ?? "Regular User"}), tone=${input.advocate?.tone ?? "helpful"}.
Guidelines: ${input.advocate?.writingGuidelines ?? ""} ${input.advocate?.voiceGuidelines ?? ""}
Disclosure: ${input.advocate?.disclosureRequirements ?? "Disclose affiliation if promoting."}
Draft type: ${input.type}. If WARMUP, do not mention the product or link. If PROMOTIONAL, mention naturally once at most.`;

  const user = `Subreddit: r/${input.post.subreddit}
Post title: ${input.post.title}
Post body: ${input.post.body ?? ""}
Campaign/product: ${input.campaign.productName ?? input.campaign.name} ${input.campaign.productUrl ?? ""}
Context: ${input.campaign.description ?? ""}
Knowledge excerpts: ${input.knowledge ?? ""}
Write only the comment text.`;

  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: process.env.AI_MODEL ?? "gpt-4o-mini",
        temperature: 0.7,
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
      }),
    });
    if (!res.ok) return demoDraft(input);
    const json = (await res.json()) as {
      choices: Array<{ message: { content: string } }>;
    };
    return json.choices[0]?.message?.content?.trim() || demoDraft(input);
  } catch {
    return demoDraft(input);
  }
}

function demoDraft(input: GenInput): string {
  if (input.type === "WARMUP") {
    return `[Demo draft — warmup] I've run into a similar issue in r/${input.post.subreddit}. One thing that helped me was breaking the problem into smaller steps and validating assumptions with a quick experiment before committing. Curious what you've already tried on "${input.post.title.slice(0, 80)}"?`;
  }
  const product = input.campaign.productName ?? input.campaign.name;
  return `[Demo draft — promotional] On "${input.post.title.slice(0, 60)}", I've had good results focusing on community signal before tooling. For what it's worth, I've been using ${product}${input.campaign.productUrl ? ` (${input.campaign.productUrl})` : ""} for tracking relevant threads — happy to share what worked / didn't if useful.`;
}
