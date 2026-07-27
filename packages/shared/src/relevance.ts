/** AI Relevance Threshold — Help Center CONFIRMED */
export const RELEVANCE_PRESETS = {
  strict: 0.7,
  balanced: 0.5,
  lenient: 0.45,
} as const;

export type RelevancePreset = keyof typeof RELEVANCE_PRESETS;

export function presetFromThreshold(threshold: number): RelevancePreset {
  if (threshold >= 0.65) return "strict";
  if (threshold <= 0.47) return "lenient";
  return "balanced";
}
