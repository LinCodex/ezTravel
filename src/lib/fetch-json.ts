/** Safe JSON parse for fetch responses that may be empty or HTML error pages. */
export async function readJson<T = unknown>(
  res: Response,
): Promise<{ ok: boolean; status: number; data: T | null; error?: string }> {
  const text = await res.text();
  if (!text.trim()) {
    return {
      ok: res.ok,
      status: res.status,
      data: null,
      error: res.ok ? undefined : `Empty response (${res.status})`,
    };
  }
  try {
    const data = JSON.parse(text) as T;
    const err =
      data && typeof data === "object" && "error" in data
        ? String((data as { error?: unknown }).error || "")
        : undefined;
    return { ok: res.ok, status: res.status, data, error: err || undefined };
  } catch {
    return {
      ok: false,
      status: res.status,
      data: null,
      error: `Invalid JSON (${res.status})`,
    };
  }
}
