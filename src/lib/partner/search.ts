/**
 * Partner portal search helpers.
 * Matching is case-insensitive and prefers prefix matches so typing "ch"
 * surfaces China / Chile without needing the full word.
 */

export function normalizeSearch(q: string): string {
  return q.trim().toLowerCase();
}

/** True if `text` starts with or contains `q` (case-insensitive). */
export function matchesSearch(text: string | null | undefined, q: string): boolean {
  const needle = normalizeSearch(q);
  if (!needle) return true;
  const hay = (text || "").toLowerCase();
  return hay.startsWith(needle) || hay.includes(needle);
}

/**
 * Prisma OR clause for SQLite: prefix first, then contains.
 * SQLite LIKE is case-insensitive for ASCII, so no mode flag needed.
 */
export function prismaTextSearch(
  fields: string[],
  q: string,
): Array<Record<string, { startsWith: string } | { contains: string }>> {
  const needle = q.trim();
  if (!needle) return [];
  const clauses: Array<Record<string, { startsWith: string } | { contains: string }>> = [];
  for (const field of fields) {
    clauses.push({ [field]: { startsWith: needle } });
  }
  for (const field of fields) {
    clauses.push({ [field]: { contains: needle } });
  }
  return clauses;
}
