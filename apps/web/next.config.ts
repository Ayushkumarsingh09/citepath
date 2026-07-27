import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@citepath/db", "@citepath/shared"],
  serverExternalPackages: ["@prisma/client", "bcryptjs"],
};

export default nextConfig;
