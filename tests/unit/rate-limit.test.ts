import { describe, expect, it } from "vitest";
import { rateLimit } from "../../apps/web/src/lib/rate-limit";

describe("rateLimit", () => {
  it("allows under limit and blocks over", () => {
    const key = `test-${Date.now()}-${Math.random()}`;
    expect(rateLimit(key, 2, 60_000).ok).toBe(true);
    expect(rateLimit(key, 2, 60_000).ok).toBe(true);
    expect(rateLimit(key, 2, 60_000).ok).toBe(false);
  });
});
