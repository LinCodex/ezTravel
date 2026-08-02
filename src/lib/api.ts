import { NextResponse } from "next/server";
import { log } from "@/lib/log";

export function jsonError(error: string, status = 400, extra?: Record<string, unknown>) {
  return NextResponse.json({ error, ...extra }, { status });
}

export function jsonOk<T extends Record<string, unknown>>(body: T, status = 200) {
  return NextResponse.json(body, { status });
}

/**
 * Wrap a route handler so unexpected throws become consistent JSON 500s.
 * Swap for a richer error reporter later (Sentry, etc.).
 */
export function withErrorHandling(
  handler: (req: Request, ctx?: unknown) => Promise<Response>,
) {
  return async (req: Request, ctx?: unknown) => {
    try {
      return await handler(req, ctx);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Internal error";
      log.error("api.unhandled", { message, path: new URL(req.url).pathname });
      return jsonError(message, 500);
    }
  };
}
