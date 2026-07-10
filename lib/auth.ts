import { cookies } from "next/headers";
import { AUTH_COOKIE } from "@/lib/constants";
import { jwtMaxAge } from "@/lib/jwt";

export async function checkLoggedIn(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE)?.value;
  if (!token) return false;

  const maxAge = jwtMaxAge(token);
  return maxAge !== undefined && maxAge > 0;
}
