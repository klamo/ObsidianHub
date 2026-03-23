import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@obsidianhub/actions", "@obsidianhub/config", "@obsidianhub/core", "@obsidianhub/vault"],
  outputFileTracingRoot: path.resolve(__dirname, "../.."),
};

export default nextConfig;
