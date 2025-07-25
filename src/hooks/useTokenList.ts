import { useEffect, useState, useCallback, useMemo } from 'react';
import fallbackTokens from '@/config/fallbackTokens.json';
import { Token, MEME_TOKEN } from '@/config/tokens';
import { debounce } from 'lodash';

const CACHE_KEY = 'frenzySwapTokenCache';
const CACHE_DURATION = 12 * 60 * 60 * 1000; // 12 hours
const CACHE_VERSION = '1.1'; // Increment to force cache refresh

const saveToCache = debounce((tokens: Token[]) => {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ 
      data: tokens, 
      timestamp: Date.now(),
      version: CACHE_VERSION 
    }));
  } catch (e) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('LocalStorage write failed', e);
    }
  }
}, 500);

const loadFromCache = (): { data: Token[]; timestamp: number; version?: string } | null => {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) return null;
    const parsedCache = JSON.parse(cached);
    
    // Check cache version - if different, ignore cache
    if (parsedCache.version !== CACHE_VERSION) {
      localStorage.removeItem(CACHE_KEY);
      return null;
    }
    
    return parsedCache;
  } catch (e) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('LocalStorage read failed', e);
    }
  }
  return null;
};

export function useTokenList() {
  const [tokens, setTokens] = useState<Token[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [rateLimitError, setRateLimitError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  // Load cache instantly on mount
  useEffect(() => {
    const cached = loadFromCache();
    if (cached && Array.isArray(cached.data)) {
      setTokens([
        MEME_TOKEN,
        ...cached.data.filter((t) => t.address !== MEME_TOKEN.address),
      ]);
      setLoading(false);
    } else {
      setTokens([
        MEME_TOKEN,
        ...fallbackTokens.filter((t) => t.address !== MEME_TOKEN.address),
      ]);
      setLoading(false);
    }
  }, []);

  // Background refresh if cache is stale or retry requested
  useEffect(() => {
    const cached = loadFromCache();
    const isStale = !cached || (Date.now() - cached.timestamp > CACHE_DURATION);
    if (isStale || retryCount > 0) {
      (async () => {
        setLoading(true);
        setError(false);
        let attempt = 0;
        let delay = 500;
        let success = false;
        while (attempt < 5 && !success) {
          try {
            const res = await fetch('/api/tokens', { cache: 'no-store' });
            if (!res.ok) throw new Error('Fetch failed');
            const json: Token[] = await res.json();
            const sorted = [
              MEME_TOKEN,
              ...json.filter((t) => t.address !== MEME_TOKEN.address),
            ];
            setTokens(sorted);
            saveToCache(sorted);
            success = true;
          } catch (err) {
            attempt++;
            const errorObj = err as any;
            if (errorObj.message?.includes('rate limit')) {
              setRateLimitError('Rate limit reached, please wait and retry.');
              setError(true);
              break;
            }
            await new Promise(r => setTimeout(r, delay));
            delay *= 2;
          }
        }
        if (!success) {
          // fallback: use cache if available, else fallbackTokens
          const fallback = cached?.data || fallbackTokens;
          const sorted = [
            MEME_TOKEN,
            ...fallback.filter((t) => t.address !== MEME_TOKEN.address),
          ];
          setTokens(sorted);
          setError(true);
        }
        setLoading(false);
      })();
    }
  }, [retryCount]);

  const retry = () => setRetryCount((c) => c + 1);
  const invalidateCache = () => localStorage.removeItem(CACHE_KEY);

  const filteredTokens = useMemo(() => {
    if (!searchQuery) return tokens;
    const query = searchQuery.toLowerCase();
    return tokens.filter((t) =>
      t.symbol.toLowerCase().includes(query) || 
      t.name.toLowerCase().includes(query) ||
      t.address.toLowerCase().includes(query)
    );
  }, [tokens, searchQuery]);

  return {
    tokens: filteredTokens,
    loading,
    error,
    rateLimitError,
    retry,
    setSearchQuery,
    invalidateCache,
  };
}