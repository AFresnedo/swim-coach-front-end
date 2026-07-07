import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  experimental: {
    // Corruption risk after branch switches/merges is mitigated by the
    // .githooks/post-checkout and .githooks/post-merge hooks, which clear
    // .next on those events — see `git config core.hooksPath .githooks`.
    turbopackFileSystemCacheForDev: true,
  },
};

export default nextConfig;
