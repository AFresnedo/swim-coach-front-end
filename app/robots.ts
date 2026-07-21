import type { MetadataRoute } from "next";
import { SITE_INDEXABLE } from "@/shared/constants";

// Without this, Next.js prerenders robots.txt once at build time (it has no
// request-time APIs), so a runtime env var flip on the deployed container
// would silently be ignored — it'd keep serving whatever was baked in at
// the image's CI build.
export const dynamic = "force-dynamic";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: SITE_INDEXABLE ? { userAgent: "*", allow: "/" } : { userAgent: "*", disallow: "/" },
  };
}
