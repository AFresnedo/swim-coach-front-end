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

export async function setAuthCookie(token: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(AUTH_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    // Expire the cookie exactly when the JWT does, so a dead token doesn't
    // linger in the browser as a still-present-but-useless cookie.
    maxAge: jwtMaxAge(token),
  });
}
