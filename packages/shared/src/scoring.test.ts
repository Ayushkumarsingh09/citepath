import { describe, expect, it } from "vitest";
import { computeOpportunityScore, lexicalOverlap } from "./scoring";
import { promotionalRatio, warmupDailyCap } from "./karma";
import { effectiveLimits } from "./plans";

describe("computeOpportunityScore", () => {
  it("weights components and subtracts promotional risk", () => {
    const { finalScore } = computeOpportunityScore({
      semanticRelevance: 1,
      intent: 1,
      productFit: 1,
      freshness: 1,
      engagementPotential: 1,
      geoPotential: 1,
      promotionalRisk: 0,
    });
    expect(finalScore).toBeGreaterThan(0.9);
  });

  it("penalizes promotional risk", () => {
    const high = computeOpportunityScore({
      semanticRelevance: 0.8,
      intent: 0.8,
      productFit: 0.8,
      freshness: 0.8,
      engagementPotential: 0.8,
      geoPotential: 0.8,
      promotionalRisk: 0,
    }).finalScore;
    const low = computeOpportunityScore({
      semanticRelevance: 0.8,
      intent: 0.8,
      productFit: 0.8,
      freshness: 0.8,
      engagementPotential: 0.8,
      geoPotential: 0.8,
      promotionalRisk: 1,
    }).finalScore;
    expect(high).toBeGreaterThan(low);
  });
});

describe("lexicalOverlap", () => {
  it("scores keyword hits", () => {
    expect(lexicalOverlap("best crm for startups", ["crm", "startup"])).toBeGreaterThan(0.3);
  });
});

describe("karma rules", () => {
  it("maps promotional ratio tiers", () => {
    expect(promotionalRatio(0)).toBe(0);
    expect(promotionalRatio(10)).toBe(0.2);
    expect(promotionalRatio(500)).toBe(0.8);
  });

  it("warmup caps by day", () => {
    const start = new Date("2026-07-01T00:00:00Z");
    expect(warmupDailyCap(start, new Date("2026-07-01T12:00:00Z"))).toBe(0);
    expect(warmupDailyCap(start, new Date("2026-07-03T12:00:00Z"))).toBe(1);
    expect(warmupDailyCap(start, new Date("2026-07-10T12:00:00Z"))).toBe(Number.POSITIVE_INFINITY);
  });
});

describe("entitlements", () => {
  it("applies draft bundle add-ons", () => {
    const limits = effectiveLimits("STARTER", { addonDraftBundles: 2 });
    expect(limits.draftsPerDay).toBe(15);
  });
});
