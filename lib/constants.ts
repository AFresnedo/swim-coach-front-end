export const AUTH_COOKIE = "access_token";

// Soft-launch gate: set SITE_INDEXABLE=true in the environment once the site
// is ready for crawlers/search engines. Fails closed (not indexable) if
// unset, so a missing env var can't accidentally expose an unfinished site.
export const SITE_INDEXABLE = process.env.SITE_INDEXABLE === "true";
