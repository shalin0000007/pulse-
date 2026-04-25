/**
 * Simple in-memory TTL cache to avoid hammering APIs
 * Rate limit: Bags API = 1,000 req/hour
 */

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

class TTLCache {
  private cache: Map<string, CacheEntry<unknown>> = new Map();

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }
    return entry.value as T;
  }

  set<T>(key: string, value: T, ttlMs: number): void {
    this.cache.set(key, {
      value,
      expiresAt: Date.now() + ttlMs,
    });
  }

  invalidate(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  /** Remove all expired entries */
  prune(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.cache.delete(key);
      }
    }
  }
}

// Singleton cache instance
export const cache = new TTLCache();

// Common TTLs
export const CACHE_TTL = {
  TOKENS: 25_000,       // 25 seconds (heatmap refreshes every 30s)
  MARKET_DATA: 30_000,  // 30 seconds
  HOLDERS: 300_000,     // 5 minutes
  AI_BRIEF: 6 * 60 * 60 * 1000, // 6 hours
  LEADERBOARD: 60_000,  // 1 minute
  FEE_SHARE: 300_000,   // 5 minutes
} as const;
