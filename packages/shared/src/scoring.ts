export type ScoreWeights = {
  semanticRelevance: number;
  intent: number;
  productFit: number;
  freshness: number;
  engagementPotential: number;
  geoPotential: number;
  promotionalRisk: number;
};

export const DEFAULT_WEIGHTS: ScoreWeights = {
  semanticRelevance: 0.28,
  intent: 0.18,
  productFit: 0.18,
  freshness: 0.1,
  engagementPotential: 0.1,
  geoPotential: 0.08,
  promotionalRisk: 0.08,
};

export type ScoreComponents = {
  semanticRelevance: number;
  intent: number;
  productFit: number;
  freshness: number;
  engagementPotential: number;
  geoPotential: number;
  promotionalRisk: number;
};

/** All component inputs expected in [0, 1]. */
export function computeOpportunityScore(
  components: ScoreComponents,
  weights: ScoreWeights = DEFAULT_WEIGHTS,
): { finalScore: number; components: ScoreComponents; weights: ScoreWeights } {
  const clamp = (n: number) => Math.max(0, Math.min(1, n));
  const c = {
    semanticRelevance: clamp(components.semanticRelevance),
    intent: clamp(components.intent),
    productFit: clamp(components.productFit),
    freshness: clamp(components.freshness),
    engagementPotential: clamp(components.engagementPotential),
    geoPotential: clamp(components.geoPotential),
    promotionalRisk: clamp(components.promotionalRisk),
  };

  const positive =
    weights.semanticRelevance * c.semanticRelevance +
    weights.intent * c.intent +
    weights.productFit * c.productFit +
    weights.freshness * c.freshness +
    weights.engagementPotential * c.engagementPotential +
    weights.geoPotential * c.geoPotential;

  const finalScore = clamp(positive - weights.promotionalRisk * c.promotionalRisk);
  return { finalScore, components: c, weights };
}

/** Cheap lexical relevance before deeper scoring. */
export function lexicalOverlap(text: string, keywords: string[]): number {
  if (!keywords.length) return 0;
  const hay = text.toLowerCase();
  let hits = 0;
  for (const kw of keywords) {
    const k = kw.trim().toLowerCase();
    if (k && hay.includes(k)) hits += 1;
  }
  return Math.min(1, hits / Math.max(1, Math.min(keywords.length, 5)));
}

export function freshnessScore(createdUtc: Date, now = new Date()): number {
  const ageHours = (now.getTime() - createdUtc.getTime()) / 3_600_000;
  if (ageHours <= 6) return 1;
  if (ageHours <= 24) return 0.85;
  if (ageHours <= 72) return 0.6;
  if (ageHours <= 168) return 0.35;
  return 0.15;
}

export function engagementPotential(score: number, numComments: number): number {
  const s = Math.log10(Math.max(1, score + 1)) / 4;
  const c = Math.log10(Math.max(1, numComments + 1)) / 3;
  return Math.max(0, Math.min(1, 0.55 * s + 0.45 * c));
}

const INTENT_PATTERNS = [
  /recommend/i,
  /looking for/i,
  /anyone use/i,
  /alternative to/i,
  /best .* for/i,
  /how (do|can) (i|you)/i,
  /suggest/i,
  /which .* should/i,
];

export function intentClassification(title: string, body?: string | null): number {
  const text = `${title}\n${body ?? ""}`;
  let hits = 0;
  for (const re of INTENT_PATTERNS) if (re.test(text)) hits += 1;
  return Math.min(1, 0.35 + hits * 0.2);
}
