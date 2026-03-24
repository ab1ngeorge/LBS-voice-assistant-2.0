// ─── Response Cache ────────────────────────────────────────────────────────
// In-memory LRU cache for LLM responses. Avoids repeat API calls for
// identical (normalised) queries within the same session.
// Resets on page reload — no localStorage needed.

// ─── Config ────────────────────────────────────────────────────────────────

const MAX_ENTRIES = 50;
const TTL_MS = 10 * 60 * 1000; // 10 minutes

// ─── Types ─────────────────────────────────────────────────────────────────

interface CacheEntry {
  response: string;
  timestamp: number;
}

// ─── Store ─────────────────────────────────────────────────────────────────

const cache = new Map<string, CacheEntry>();

// ─── Helpers ───────────────────────────────────────────────────────────────

/** Normalise the key so minor wording differences still hit the cache. */
function toKey(query: string): string {
  return query.toLowerCase().trim();
}

/** Evict the oldest entry when the cache exceeds MAX_ENTRIES. */
function evictOldest(): void {
  if (cache.size <= MAX_ENTRIES) return;

  // Map iterates in insertion order — first key is the oldest
  const oldestKey = cache.keys().next().value;
  if (oldestKey !== undefined) {
    cache.delete(oldestKey);
  }
}

// ─── Public API ────────────────────────────────────────────────────────────

/**
 * Look up a cached response for the given (normalised) query.
 * Returns `null` if no valid entry exists or the entry has expired.
 */
export function getCachedResponse(query: string): string | null {
  const key = toKey(query);
  const entry = cache.get(key);

  if (!entry) return null;

  // Check TTL
  if (Date.now() - entry.timestamp > TTL_MS) {
    cache.delete(key);
    return null;
  }

  // Move to end (LRU refresh): delete + re-insert
  cache.delete(key);
  cache.set(key, entry);

  return entry.response;
}

/**
 * Store a response in the cache, keyed by the normalised query.
 */
export function setCachedResponse(query: string, response: string): void {
  const key = toKey(query);

  // If key already exists, delete it first so re-insertion moves it to the end
  cache.delete(key);
  cache.set(key, { response, timestamp: Date.now() });

  evictOldest();
}

/**
 * Clear the entire cache. Useful for testing or manual reset.
 */
export function clearResponseCache(): void {
  cache.clear();
}

/**
 * Returns the current number of entries in the cache (for debugging/stats).
 */
export function getResponseCacheSize(): number {
  return cache.size;
}
