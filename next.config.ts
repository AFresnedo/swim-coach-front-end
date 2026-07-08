import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  experimental: {
    // Corruption risk after branch switches/merges: the .githooks/post-checkout
    // and .githooks/post-merge hooks warn when this may be stale (they don't
    // auto-clear .next, since that breaks a running dev server until it's
    // restarted) — see `git config core.hooksPath .githooks`.
    turbopackFileSystemCacheForDev: true,
  },
};

export default nextConfig;
