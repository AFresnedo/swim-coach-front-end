import type { MetadataRoute } from "next";
import { SITE_INDEXABLE } from "@/lib/constants";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: SITE_INDEXABLE ? { userAgent: "*", allow: "/" } : { userAgent: "*", disallow: "/" },
  };
}
