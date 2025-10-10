import { useEffect, useState, useCallback, useMemo, useRef } from 'react';
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
  const [searchFeedback, setSearchFeedback] = useState<{
    isSearching: boolean;
    hasResults: boolean;
    searchTerm: string;
    message?: string;
  }>({
    isSearching: false,
    hasResults: true,
    searchTerm: '',
  });
  // Store the verified set in a ref for fast cross-check
  const verifiedSetRef = useRef<Set<string>>(new Set());

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
    const hasFullTokenList = cached && cached.data && cached.data.length > 50000;
    const shouldRefresh = isStale || retryCount > 0 || cached?.version !== CACHE_VERSION || !hasFullTokenList;

    if (shouldRefresh) {
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
            const json = await res.json();
            // Support new API format: { tokens, verifiedAddresses }
            let tokenList: Token[] = [];
            if (Array.isArray(json)) {
              tokenList = json;
            } else if (json.tokens && Array.isArray(json.tokens)) {
              tokenList = json.tokens;
              if (Array.isArray(json.verifiedAddresses)) {
                verifiedSetRef.current = new Set(json.verifiedAddresses);
              }
            }
            // Cross-check all tokens for verification
            const sorted = [
              MEME_TOKEN,
              ...tokenList.map((t) => ({
                ...t,
                verified: t.verified || verifiedSetRef.current.has(t.address),
              })).filter((t) => t.address !== MEME_TOKEN.address),
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

  // Enhanced DexScreener search using our API endpoint
  const searchDexScreener = async (query: string): Promise<Token[]> => {
    if (!query || query.length < 32) return [];
    
    try {
      console.log(`[DexScreener] 🔍 Searching via API for: ${query}`);
      
      const response = await fetch(`/api/tokens/search?q=${encodeURIComponent(query)}`, {
        cache: 'no-store',
        signal: AbortSignal.timeout(10000), // 10 second timeout
      });

      if (!response.ok) {
        console.log(`[DexScreener] ❌ API error: ${response.status}`);
        return [];
      }

      const token = await response.json();
      
      console.log(`[DexScreener] ✅ Found token via API: ${token.symbol} (${token.name})`);
      console.log(`[DexScreener] 🖼️ Logo URL: ${token.logoURI}`);
      
      return [token];
    } catch (error) {
      console.error('[DexScreener] API Error:', error);
      return [];
    }
  };

  // DexScreener search effect
  useEffect(() => {
    if (!searchQuery) {
      setDexScreenerResults([]);
      setSearchFeedback({
        isSearching: false,
        hasResults: true,
        searchTerm: '',
      });
      return;
    }

    const query = searchQuery.toLowerCase();
    setSearchFeedback({
      isSearching: true,
      hasResults: false,
      searchTerm: searchQuery,
      message: 'Searching...'
    });

    const jupiterResults = tokens.filter((t) =>
      t.symbol.toLowerCase().includes(query) || 
      t.name.toLowerCase().includes(query) ||
      t.address.toLowerCase().includes(query)
    );

    // If we have Jupiter results, clear DexScreener results and update feedback
    if (jupiterResults.length > 0) {
      setDexScreenerResults([]);
      setSearchFeedback({
        isSearching: false,
        hasResults: true,
        searchTerm: searchQuery,
      });
      return;
    }

    // If no Jupiter results and query looks like a contract address (32+ chars, alphanumeric)
    const isContractAddress = /^[A-Za-z0-9]{32,}$/.test(searchQuery.trim());
    
    if (isContractAddress) {
      console.log(`[TokenList] 🔄 No Jupiter results for ${searchQuery}, trying DexScreener...`);
      setSearchingDexScreener(true);
      setSearchFeedback({
        isSearching: true,
        hasResults: false,
        searchTerm: searchQuery,
        message: 'Searching DexScreener for unknown token...'
      });
      
      // Debounced DexScreener search
      const debouncedSearch = debounce(async () => {
        const dexResults = await searchDexScreener(searchQuery.trim());
        setDexScreenerResults(dexResults);
        setSearchingDexScreener(false);
        
        // Update feedback based on results
        if (dexResults.length > 0) {
          setSearchFeedback({
            isSearching: false,
            hasResults: true,
            searchTerm: searchQuery,
          });
        } else {
          setSearchFeedback({
            isSearching: false,
            hasResults: false,
            searchTerm: searchQuery,
            message: `No token found for "${searchQuery}". Please check the contract address and try again.`
          });
        }
      }, 500);
      
      debouncedSearch();
      
      // Cleanup function to cancel debounced search
      return () => {
        debouncedSearch.cancel();
      };
    } else {
      // Not a contract address, clear DexScreener results and show appropriate message
      setDexScreenerResults([]);
      setSearchFeedback({
        isSearching: false,
        hasResults: false,
        searchTerm: searchQuery,
        message: query.length < 32 
          ? `No tokens found for "${searchQuery}". Try searching by symbol (e.g., "SOL") or paste a 32+ character contract address.`
          : `No tokens found for "${searchQuery}". Please check your search term and try again.`
      });
    }
  }, [searchQuery, tokens]);

  const filteredTokens = useMemo(() => {
    if (!searchQuery) return tokens;
    const query = searchQuery.toLowerCase();
    const jupiterResults = tokens.map((t) => ({
      ...t,
      verified: t.verified || verifiedSetRef.current.has(t.address),
    })).filter((t) =>
      t.symbol.toLowerCase().includes(query) ||
      t.name.toLowerCase().includes(query) ||
      t.address.toLowerCase().includes(query)
    );
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
    searchFeedback,
    verifiedSet: verifiedSetRef.current,
  };
}