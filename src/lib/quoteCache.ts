// ⚡ SPEED OPTIMIZATION: Client-side quote cache to reduce redundant API calls
interface CachedQuote {
  quote: any;
  timestamp: number;
  expiresAt: number;
}

class QuoteCache {
  private cache = new Map<string, CachedQuote>();
  private readonly CACHE_DURATION = 15000; // 15 seconds cache
  private readonly MAX_CACHE_SIZE = 100;

  private generateKey(
    fromMint: string,
    toMint: string,
    amount: string,
    slippage: number
  ): string {
    return `${fromMint}-${toMint}-${amount}-${slippage}`;
  }

  get(
    fromMint: string,
    toMint: string,
    amount: string,
    slippage: number
  ): any | null {
    const key = this.generateKey(fromMint, toMint, amount, slippage);
    const cached = this.cache.get(key);

    if (!cached) return null;

    // Check if cache is expired
    if (Date.now() > cached.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return cached.quote;
  }

  set(
    fromMint: string,
    toMint: string,
    amount: string,
    slippage: number,
    quote: any
  ): void {
    const key = this.generateKey(fromMint, toMint, amount, slippage);
    
    // Clean up expired entries if cache is getting too large
    if (this.cache.size >= this.MAX_CACHE_SIZE) {
      this.cleanup();
    }

    this.cache.set(key, {
      quote,
      timestamp: Date.now(),
      expiresAt: Date.now() + this.CACHE_DURATION,
    });
  }

  private cleanup(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];

    for (const [key, cached] of this.cache.entries()) {
      if (now > cached.expiresAt) {
        keysToDelete.push(key);
      }
    }

    keysToDelete.forEach(key => this.cache.delete(key));

    // If still too large, remove oldest entries
    if (this.cache.size >= this.MAX_CACHE_SIZE) {
      const entries = Array.from(this.cache.entries());
      entries.sort((a, b) => a[1].timestamp - b[1].timestamp);
      
      const toRemove = entries.slice(0, Math.floor(this.MAX_CACHE_SIZE / 2));
      toRemove.forEach(([key]) => this.cache.delete(key));
    }
  }

  clear(): void {
    this.cache.clear();
  }

  // Get cache statistics for debugging
  getStats() {
    const now = Date.now();
    const entries = Array.from(this.cache.values());
    const valid = entries.filter(e => now <= e.expiresAt).length;
    const expired = entries.length - valid;

    return {
      total: entries.length,
      valid,
      expired,
      size: this.cache.size
    };
  }
}

// Singleton instance
export const quoteCache = new QuoteCache();