import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["tests/unit/**/*.test.ts", "packages/shared/src/**/*.test.ts"],
    exclude: ["tests/e2e/**", "tests/integration/**", "**/node_modules/**"],
  },
});
