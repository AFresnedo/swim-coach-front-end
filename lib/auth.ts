import { cookies } from "next/headers";
import { AUTH_COOKIE } from "@/lib/constants";

export async function checkLoggedIn(): Promise<boolean> {
  const cookieStore = await cookies();
  return cookieStore.has(AUTH_COOKIE);
}
