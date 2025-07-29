// Enhanced token caching with intelligent prefetching
// src/lib/smartTokenCache.ts

import { Token } from '@/config/tokens';

interface CacheConfig {
  maxAge: number;
  maxSize: number;
  prefetchThreshold: number;
}

class SmartTokenCache {
  private cache = new Map<string, { data: Token[], timestamp: number, hitCount: number }>();
  private config: CacheConfig = {
    maxAge: 30 * 60 * 1000, // 30 minutes
    maxSize: 1000, // Max 1000 cached queries
    prefetchThreshold: 3 // Prefetch after 3 hits
  };

  // Get tokens with intelligent caching
  async getTokens(query: string = ''): Promise<Token[]> {
    const cacheKey = query.toLowerCase().trim();
    const cached = this.cache.get(cacheKey);
    
    // Check if cache is valid
    if (cached && Date.now() - cached.timestamp < this.config.maxAge) {
      cached.hitCount++;
      
      // Trigger background refresh for popular queries
      if (cached.hitCount > this.config.prefetchThreshold) {
        this.backgroundRefresh(cacheKey);
      }
      
      return cached.data;
    }
    
    // Fetch fresh data
    const tokens = await this.fetchTokens(query);
    this.setCache(cacheKey, tokens);
    return tokens;
  }

  private async fetchTokens(query: string): Promise<Token[]> {
    try {
      const response = await fetch(`/api/tokens?search=${encodeURIComponent(query)}`);
      if (!response.ok) throw new Error('Failed to fetch tokens');
      return await response.json();
    } catch (error) {
      console.error('Token fetch error:', error);
      return [];
    }
  }

  private setCache(key: string, data: Token[]) {
    // Evict old entries if cache is full
    if (this.cache.size >= this.config.maxSize) {
      const oldestKey = Array.from(this.cache.entries())
        .sort((a, b) => a[1].timestamp - b[1].timestamp)[0][0];
      this.cache.delete(oldestKey);
    }
    
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      hitCount: 1
    });
  }

  private async backgroundRefresh(key: string) {
    try {
      const tokens = await this.fetchTokens(key);
      const cached = this.cache.get(key);
      if (cached) {
        cached.data = tokens;
        cached.timestamp = Date.now();
      }
    } catch (error) {
      console.warn('Background refresh failed:', error);
    }
  }

  // Preload popular tokens for instant display
  async preloadPopularTokens() {
    const popularQueries = ['', 'SOL', 'USDC', 'USDT', 'MEME'];
    
    for (const query of popularQueries) {
      try {
        await this.getTokens(query);
        // Small delay to avoid overwhelming the API
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error) {
        console.warn(`Failed to preload ${query}:`, error);
      }
    }
  }

  // Clear cache when needed
  clear() {
    this.cache.clear();
  }

  // Get cache statistics for debugging
  getStats() {
    return {
      size: this.cache.size,
      entries: Array.from(this.cache.entries()).map(([key, value]) => ({
        key,
        timestamp: value.timestamp,
        hitCount: value.hitCount,
        dataSize: value.data.length
      }))
    };
  }
}

// Singleton instance
export const smartTokenCache = new SmartTokenCache();

// Initialize preloading when the module loads
if (typeof window !== 'undefined') {
  // Delay preloading to not block initial page load
  setTimeout(() => {
    smartTokenCache.preloadPopularTokens();
  }, 2000);
}
