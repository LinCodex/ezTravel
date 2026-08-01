"use client";

/**
 * Lightweight client-side memory + localStorage cache
 * Provides instant (0ms) data retrieval for fast navigation
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

const memoryCache = new Map<string, CacheEntry<unknown>>();

export function getCached<T>(key: string, maxAgeMs = 5 * 60 * 1000): T | null {
  // 1. Check memory cache first
  const mem = memoryCache.get(key);
  if (mem && Date.now() - mem.timestamp < maxAgeMs) {
    return mem.data as T;
  }

  // 2. Check localStorage fallback
  if (typeof window !== "undefined") {
    try {
      const raw = localStorage.getItem(`ez_cache_${key}`);
      if (raw) {
        const entry: CacheEntry<T> = JSON.parse(raw);
        if (Date.now() - entry.timestamp < maxAgeMs) {
          memoryCache.set(key, entry);
          return entry.data;
        }
      }
    } catch {
      // Ignore localStorage read errors
    }
  }

  return null;
}

export function setCached<T>(key: string, data: T): void {
  const entry: CacheEntry<T> = { data, timestamp: Date.now() };
  memoryCache.set(key, entry);

  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(`ez_cache_${key}`, JSON.stringify(entry));
    } catch {
      // Ignore localStorage write quota errors
    }
  }
}

export async function fetchWithCache<T>(
  url: string,
  maxAgeMs = 5 * 60 * 1000
): Promise<T> {
  const cached = getCached<T>(url, maxAgeMs);
  if (cached !== null) {
    return cached;
  }

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Fetch failed: ${res.status}`);
  }
  const data: T = await res.json();
  setCached(url, data);
  return data;
}
