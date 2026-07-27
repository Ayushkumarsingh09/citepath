import path from "path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@citepath/db", "@citepath/shared"],
  serverExternalPackages: ["@prisma/client", "bcryptjs"],
  // Monorepo: include Prisma engines from the workspace root in serverless traces
  outputFileTracingRoot: path.join(__dirname, "../.."),
  outputFileTracingIncludes: {
    "/*": [
      "./node_modules/.prisma/client/**/*",
      "./node_modules/@prisma/client/**/*",
      "../../node_modules/.prisma/client/**/*",
      "../../node_modules/@prisma/client/**/*",
      "../../node_modules/.pnpm/@prisma+client@*/node_modules/.prisma/client/**/*",
      "../../node_modules/.pnpm/@prisma+client@*/node_modules/@prisma/client/**/*",
    ],
  },
};

export default nextConfig;
