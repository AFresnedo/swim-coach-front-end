import { API_URL, safeFetch } from "@/shared/back-api";

export async function getUserCount(): Promise<number | null> {
  try {
    const res = await safeFetch("users-count", `${API_URL}/stats/users-count`, {
      next: { revalidate: 300 },
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
  try {
    const res = await safeFetch("swims-count", `${API_URL}/stats/swims-count`, {
      next: { revalidate: 300 },
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.swim_count;
  } catch {
    return null;
  }
}
