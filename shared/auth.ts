import { cookies } from "next/headers";

export const AUTH_COOKIE = "access_token";

function jwtMaxAge(token: string): number | undefined {
  // TODO: log when this falls back (no payload segment / bad JSON / missing exp) once
  // we have a real logging system — console logging isn't useful outside local dev.
  const payload = token.split(".")[1];
  if (!payload) return undefined;

  try {
    const { exp } = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    return typeof exp === "number" ? Math.max(0, exp - Math.floor(Date.now() / 1000)) : undefined;
  } catch {
    return undefined;
  }
}

export async function getAuthToken(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get(AUTH_COOKIE)?.value;
}

export async function checkLoggedIn(): Promise<boolean> {
  const token = await getAuthToken();
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
