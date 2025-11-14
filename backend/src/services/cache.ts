// src/services/cache.ts

type CacheEntry<T> = {
  value: T;
  expiresAt: number;
};

class SimpleCache<T> {
  private store = new Map<string, CacheEntry<T>>();

  set(key: string, value: T, ttlMs: number) {
    this.store.set(key, {
      value,
      expiresAt: Date.now() + ttlMs
    });
  }

  get(key: string): T | undefined {
    const entry = this.store.get(key);
    if (!entry) return undefined;

    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return undefined;
    }

    return entry.value;
  }

  delete(key: string) {
    this.store.delete(key);
  }
}

export const userCache = new SimpleCache<any>();
export const abacRuleCache = new SimpleCache<any>();
