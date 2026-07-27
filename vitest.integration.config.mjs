import { defineConfig } from "vitest/config";
import path from "path";
import { fileURLToPath } from "url";

const root = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  test: {
    include: ["tests/integration/**/*.test.ts"],
    testTimeout: 30_000,
    fileParallelism: false,
  },
  resolve: {
    alias: {
      "@citepath/db": path.join(root, "packages/db/src/index.ts"),
      "@citepath/shared": path.join(root, "packages/shared/src/index.ts"),
    },
  },
});
