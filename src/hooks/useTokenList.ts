import { useEffect, useState, useCallback, useMemo } from 'react';
import fallbackTokens from '@/config/fallbackTokens.json';
import { Token, MEME_TOKEN } from '@/config/tokens';
import { debounce } from 'lodash';

const CACHE_KEY = 'frenzySwapTokenCache';
const CACHE_DURATION = 12 * 60 * 60 * 1000; // 12 hours
const CACHE_VERSION = '2.1'; // Increment to force cache refresh - v2.1 ensures full token list (287K+ tokens)

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
  const [dexScreenerResults, setDexScreenerResults] = useState<Token[]>([]);
  const [searchingDexScreener, setSearchingDexScreener] = useState(false);

  // Load cache instantly on mount
  useEffect(() => {
    const cached = loadFromCache();
    if (cached && Array.isArray(cached.data)) {
      console.log(`[TokenList] 📦 Loading ${cached.data.length} tokens from cache (version: ${cached.version})`);
      setTokens([
        MEME_TOKEN,
        ...cached.data.filter((t) => t.address !== MEME_TOKEN.address),
      ]);
      setLoading(false);
    } else {
      console.log(`[TokenList] 🚫 No valid cache found, using ${fallbackTokens.length} fallback tokens`);
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
    const hasFullTokenList = cached && cached.data && cached.data.length > 50000; // Check if we have the full list
    const shouldRefresh = isStale || retryCount > 0 || cached?.version !== CACHE_VERSION || !hasFullTokenList;
    
    console.log(`[TokenList] 🔄 Refresh check: isStale=${isStale}, retryCount=${retryCount}, versionMismatch=${cached?.version !== CACHE_VERSION}, hasFullList=${hasFullTokenList} (${cached?.data?.length || 0} tokens)`);
    
    if (shouldRefresh) {
      (async () => {
        setLoading(true);
        setError(false);
        let attempt = 0;
        let delay = 500;
        let success = false;
        while (attempt < 5 && !success) {
          try {
            console.log(`[TokenList] 🔄 Fetching fresh tokens from API (attempt ${attempt + 1})`);
            const res = await fetch('/api/tokens', { cache: 'no-store' });
            if (!res.ok) throw new Error('Fetch failed');
            const json: Token[] = await res.json();
            console.log(`[TokenList] ✅ Successfully fetched ${json.length} tokens from API`);
            const sorted = [
              MEME_TOKEN,
              ...json.filter((t) => t.address !== MEME_TOKEN.address),
            ];
            setTokens(sorted);
            saveToCache(sorted);
            console.log(`[TokenList] 💾 Cached ${sorted.length} tokens to localStorage`);
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
  const invalidateCache = () => {
    console.log('[TokenList] 🗑️ Manually invalidating cache and forcing refresh');
    localStorage.removeItem(CACHE_KEY);
    setRetryCount((c) => c + 1);
  };

  // DexScreener fallback search function
  const searchDexScreener = async (query: string): Promise<Token[]> => {
    try {
      console.log(`[DexScreener] 🔍 Searching for: ${query}`);
      const response = await fetch(`https://api.dexscreener.com/latest/dex/tokens/${query}`);
      
      if (!response.ok) {
        console.log(`[DexScreener] ❌ API error: ${response.status}`);
        return [];
      }
      
      const data = await response.json();
      
      if (!data.pairs || data.pairs.length === 0) {
        console.log(`[DexScreener] ❌ No pairs found for ${query}`);
        return [];
      }

      // Extract unique tokens from pairs (avoiding duplicates)
      const tokensMap = new Map<string, Token>();
      
      data.pairs.forEach((pair: any) => {
        if (pair.chainId === 'solana' && pair.baseToken) {
          const token = pair.baseToken;
          if (token.address && token.symbol && token.name) {
            tokensMap.set(token.address, {
              address: token.address,
              name: token.name,
              symbol: token.symbol,
              decimals: 9, // Default for most Solana tokens
              logoURI: '/token-fallback.png', // Default logo
              price: pair.priceUsd ? parseFloat(pair.priceUsd) : undefined,
              verified: false, // DexScreener tokens are not verified
              isFromDexScreener: true, // Flag to indicate source
            });
          }
        }
      });

      const foundTokens = Array.from(tokensMap.values());
      console.log(`[DexScreener] ✅ Found ${foundTokens.length} tokens:`, foundTokens.map(t => `${t.symbol} (${t.address})`));
      
      return foundTokens;
    } catch (error) {
      console.error('[DexScreener] Error:', error);
      return [];
    }
  };

  // DexScreener search effect
  useEffect(() => {
    if (!searchQuery) {
      setDexScreenerResults([]);
      return;
    }

    const query = searchQuery.toLowerCase();
    const jupiterResults = tokens.filter((t) =>
      t.symbol.toLowerCase().includes(query) || 
      t.name.toLowerCase().includes(query) ||
      t.address.toLowerCase().includes(query)
    );

    // If we have Jupiter results, clear DexScreener results
    if (jupiterResults.length > 0) {
      setDexScreenerResults([]);
      return;
    }

    // If no Jupiter results and query looks like a contract address (32+ chars, alphanumeric)
    const isContractAddress = /^[A-Za-z0-9]{32,}$/.test(searchQuery.trim());
    
    if (isContractAddress) {
      console.log(`[TokenList] 🔄 No Jupiter results for ${searchQuery}, trying DexScreener...`);
      setSearchingDexScreener(true);
      
      // Debounced DexScreener search
      const debouncedSearch = debounce(async () => {
        const dexResults = await searchDexScreener(searchQuery.trim());
        setDexScreenerResults(dexResults);
        setSearchingDexScreener(false);
      }, 500);
      
      debouncedSearch();
      
      // Cleanup function to cancel debounced search
      return () => {
        debouncedSearch.cancel();
      };
    } else {
      // Not a contract address, clear DexScreener results
      setDexScreenerResults([]);
    }
  }, [searchQuery, tokens]);

  const filteredTokens = useMemo(() => {
    if (!searchQuery) return tokens;
    
    const query = searchQuery.toLowerCase();
    const jupiterResults = tokens.filter((t) =>
      t.symbol.toLowerCase().includes(query) || 
      t.name.toLowerCase().includes(query) ||
      t.address.toLowerCase().includes(query)
    );

    // Return combination of Jupiter results + DexScreener results
    return [...jupiterResults, ...dexScreenerResults];
  }, [tokens, searchQuery, dexScreenerResults]);

  return {
    tokens: filteredTokens,
    loading: loading || searchingDexScreener,
    error,
    rateLimitError,
    retry,
    setSearchQuery,
    invalidateCache,
  };
}