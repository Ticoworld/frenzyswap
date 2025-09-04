// Simple in-memory cache for serverless runtime with TTL
// Note: Suitable for single-instance or short-lived caching. Replace with Redis for multi-instance.

type Entry<T> = { value: T; expires: number };
const store = new Map<string, Entry<any>>();

export function getCache<T>(key: string): T | undefined {
  const e = store.get(key);
  if (!e) return undefined;
  if (Date.now() > e.expires) {
    store.delete(key);
    return undefined;
  }
  return e.value as T;
}

export function setCache<T>(key: string, value: T, ttlMs: number) {
  store.set(key, { value, expires: Date.now() + ttlMs });
}
