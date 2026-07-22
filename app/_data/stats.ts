import { cacheLife } from "next/cache";
import { API_URL, safeFetch } from "@/shared/back-api";

// Shared with Home's own cacheLife call (app/page.tsx), so the page's overall
// cache window can't drift out of sync with the stats it displays.
export const STATS_CACHE_LIFE = { revalidate: 60 } as const;

export async function getUserCount(): Promise<number | null> {
  "use cache";
  cacheLife(STATS_CACHE_LIFE);

  try {
    const res = await safeFetch("users-count", `${API_URL}/stats/users-count`, {
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.user_count;
  } catch {
    return null;
  }
}

export async function getSwimCount(): Promise<number | null> {
  "use cache";
  cacheLife(STATS_CACHE_LIFE);

  try {
    const res = await safeFetch("swims-count", `${API_URL}/stats/swims-count`, {
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.swim_count;
  } catch {
    return null;
  }
}
