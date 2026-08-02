/**
 * Public site origin for absolute links (quick share, emails, delivery).
 * Prefer the incoming request host so production works even when
 * NEXT_PUBLIC_APP_URL is missing or still set to localhost.
 */
export function appOrigin(req?: Request): string {
  if (req) {
    const host =
      req.headers.get("x-forwarded-host")?.split(",")[0]?.trim() ||
      req.headers.get("host")?.trim();
    if (host) {
      const forwardedProto = req.headers.get("x-forwarded-proto")?.split(",")[0]?.trim();
      const isLocal = host.startsWith("localhost") || host.startsWith("127.0.0.1");
      const proto = forwardedProto || (isLocal ? "http" : "https");
      return `${proto}://${host}`.replace(/\/$/, "");
    }
  }

  const env = process.env.NEXT_PUBLIC_APP_URL?.trim().replace(/\/$/, "");
  if (env) return env;
  return "http://localhost:3000";
}
