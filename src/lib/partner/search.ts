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

type TextFilter = { startsWith: string; mode: "insensitive" } | { contains: string; mode: "insensitive" };

/**
 * Prisma OR clause for Postgres: prefix first, then contains (case-insensitive).
 */
export function prismaTextSearch(
  fields: string[],
  q: string,
): Array<Record<string, TextFilter>> {
  const needle = q.trim();
  if (!needle) return [];
  const clauses: Array<Record<string, TextFilter>> = [];
  for (const field of fields) {
    clauses.push({ [field]: { startsWith: needle, mode: "insensitive" } });
  }
  for (const field of fields) {
    clauses.push({ [field]: { contains: needle, mode: "insensitive" } });
  }
  return clauses;
}
