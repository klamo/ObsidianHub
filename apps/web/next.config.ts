import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: [
    "@obsidianhub/config",
    "@obsidianhub/core",
    "@obsidianhub/git",
    "@obsidianhub/search",
    "@obsidianhub/sync",
    "@obsidianhub/vault"
  ]
};

export default nextConfig;
