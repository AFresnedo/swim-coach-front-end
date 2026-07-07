export function jwtMaxAge(token: string): number | undefined {
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
