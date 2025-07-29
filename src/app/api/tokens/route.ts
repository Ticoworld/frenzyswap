import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import axiosRetry from 'axios-retry';
import fallbackTokens from '@/config/fallbackTokens.json';

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic';
export const revalidate = 0;

const JUPITER_BASE_URL = 'https://token.jup.ag';
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes cache duration
const STRICT_CACHE_DURATION = 10 * 60 * 1000; // 10 minutes for strict tokens
let tokenCache: any[] = [];
let cacheTimestamp = 0;

const client = axios.create({
  baseURL: JUPITER_BASE_URL,
  timeout: 60000, // Increased timeout for large responses
  headers: {
    'Accept-Encoding': 'gzip, deflate, br',
    Accept: 'application/json',
  },
  maxContentLength: 50 * 1024 * 1024, // 50MB limit
  maxBodyLength: 50 * 1024 * 1024, // 50MB limit
});

axiosRetry(client, {
  retries: 2, // Reduced retries to fail faster
  retryDelay: axiosRetry.exponentialDelay,
  retryCondition: (error) => {
    // Don't retry on timeout errors for /all endpoint
    if (error.code === 'ECONNABORTED' && error.config?.url?.includes('/all')) {
      return false;
    }
    return axiosRetry.isNetworkOrIdempotentRequestError(error);
  },
});

const resolveIpfs = (uri: string): string => {
  if (!uri) return '/token-fallback.png';
  if (uri.startsWith('ipfs://')) return `https://ipfs.io/ipfs/${uri.slice(7)}`;
  return uri;
};

export async function GET(request: NextRequest) {
  // Add debug search functionality
  const url = new URL(request.url);
  const searchAddress = url.searchParams.get('search');
  const clearCache = url.searchParams.get('clear-cache');
  
  // Clear cache endpoint for debugging
  if (clearCache === 'true') {
    tokenCache = [];
    cacheTimestamp = 0;
    console.log('[Token Cache] 🗑️ Cache manually cleared');
    return NextResponse.json({ message: 'Cache cleared', success: true });
  }
  
  if (searchAddress) {
    console.log(`[Token Search] 🔍 Searching for address: ${searchAddress}`);
    console.log(`[Token Search] Cache has ${tokenCache.length} tokens`);
    
    const found = tokenCache.filter(token => 
      token.address.toLowerCase().includes(searchAddress.toLowerCase()) ||
      token.symbol.toLowerCase().includes(searchAddress.toLowerCase()) ||
      token.name.toLowerCase().includes(searchAddress.toLowerCase())
    );
    
    console.log(`[Token Search] Found ${found.length} matches for "${searchAddress}"`);
    if (found.length > 0) {
      console.log(`[Token Search] Matches:`, found.map(t => `${t.symbol} - ${t.address}`));
    }
    
    return NextResponse.json({
      query: searchAddress,
      totalTokens: tokenCache.length,
      matches: found.length,
      results: found
    });
  }

  // Return cached data immediately if available and fresh
  const cacheAge = Date.now() - cacheTimestamp;
  const isFullCache = tokenCache.length > 50000; // Check if we have the full token list
  const cacheTimeout = isFullCache ? CACHE_DURATION : STRICT_CACHE_DURATION;
  
  if (tokenCache.length && cacheAge < cacheTimeout) {
    console.log(`[Token Fetch] Returning cached data: ${tokenCache.length} tokens (age: ${Math.round(cacheAge/1000/60)}min)`);
    return NextResponse.json(tokenCache);
  }

  try {
    const fetchTokens = async (path: string) => {
      console.log(`[Token Fetch] Fetching from ${path}...`);
      
      // Create a custom client for this request without the request signal for /all
      // to avoid client cancellation issues
      const fetchClient = path === '/all' ? axios.create({
        baseURL: JUPITER_BASE_URL,
        timeout: 120000, // Even longer timeout for /all (2 minutes)
        headers: {
          'Accept-Encoding': 'gzip, deflate, br',
          Accept: 'application/json',
        },
        maxContentLength: 200 * 1024 * 1024, // 200MB limit for /all endpoint
        maxBodyLength: 200 * 1024 * 1024, // 200MB limit for /all endpoint
      }) : client;
      
      const requestConfig = path === '/all' ? {} : { signal: request.signal };
      const res = await fetchClient.get(path, requestConfig);
      
      if (!res.data || !Array.isArray(res.data)) {
        throw new Error(`Invalid response from ${path}: data is not an array`);
      }
      
      console.log(`[Token Fetch] Raw response from ${path}: ${res.data.length} tokens`);
      
      // Add detailed filtering logs
      const chainFilter = res.data.filter((t: any) => t.chainId === 101);
      const addressFilter = chainFilter.filter((t: any) => t.address);
      const symbolFilter = addressFilter.filter((t: any) => t.symbol);
      const nameFilter = symbolFilter.filter((t: any) => t.name);
      
      console.log(`[Token Fetch] Filtering breakdown for ${path}:`);
      console.log(`  - Total tokens: ${res.data.length}`);
      console.log(`  - ChainId 101: ${chainFilter.length}`);
      console.log(`  - With address: ${addressFilter.length}`);
      console.log(`  - With symbol: ${symbolFilter.length}`);
      console.log(`  - With name: ${nameFilter.length}`);
      
      const filteredTokens = (res.data || [])
        .filter((t: any) => t.chainId === 101 && t.address && t.symbol && t.name)
        .map((t: any) => ({
          address: t.address,
          name: t.name,
          symbol: t.symbol,
          decimals: t.decimals,
          logoURI: resolveIpfs(t.logoURI),
          price: t.priceUsd ? parseFloat(t.priceUsd) : undefined,
          verified: path === '/strict', // Mark as verified if from strict endpoint
          tags: t.tags || [],
        }));
      
      console.log(`[Token Fetch] Final filtered tokens from ${path}: ${filteredTokens.length} tokens`);
      
      // Log specific tokens for debugging
      const testAddresses = [
        '6gKwSpW4ZA92A1an7n6c6M68LgBnqtrF6kP4jhJGpump',
        'EySMjHcfK2n7npbLZ4JSZDWEje11ZTu1XzeNNkNfpump',
        'BgtsqbPo9an7F5RmEmDjj8HzufgRpZjYQLG5FZ3Dpump',
        'ASVp6k9w4QwBCTibGGSf9qbdti4uJx2Wnqf6Fxorpump'
      ];
      
      const foundTestTokens = filteredTokens.filter(token => 
        testAddresses.includes(token.address)
      );
      
      if (foundTestTokens.length > 0) {
        console.log(`[Token Fetch] 🎯 Found ${foundTestTokens.length} test tokens:`, foundTestTokens.map(t => `${t.symbol} (${t.address})`));
      } else {
        console.log(`[Token Fetch] ❌ None of the test tokens found in ${path} endpoint`);
      }
      return filteredTokens;
    };

    let tokens;
    
    // Strategy: Fetch both strict and all tokens, merge them with verification status
    try {
      console.log('[Token Fetch] Fetching tokens with verification data...');
      
      // Fetch strict tokens first (these are verified)
      const strictTokens = await fetchTokens('/strict');
      console.log(`[Token Fetch] Got ${strictTokens.length} verified tokens from /strict`);
      
      // Create a Set of verified token addresses for quick lookup
      const verifiedAddresses = new Set(strictTokens.map(t => t.address));
      
      // Fetch all tokens
      const allTokens = await fetchTokens('/all');
      console.log(`[Token Fetch] Got ${allTokens.length} total tokens from /all`);
      
      // Merge tokens, marking verification status
      const mergedTokens = allTokens.map(token => ({
        ...token,
        verified: verifiedAddresses.has(token.address),
        tags: verifiedAddresses.has(token.address) ? 
          (strictTokens.find(t => t.address === token.address)?.tags || []) : 
          token.tags
      }));
      
      tokens = mergedTokens;
      console.log(`[Token Fetch] Merged tokens: ${tokens.length} total, ${strictTokens.length} verified`);
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('[Token Fetch] Combined fetch failed, trying fallback strategies:', errorMessage);
      
      // Fallback 1: Try just /all without verification data
      try {
        tokens = await fetchTokens('/all');
        console.log(`[Token Fetch] Fallback: got ${tokens.length} tokens from /all (no verification data)`);
      } catch (allError) {
        console.error('[Token Fetch] /all endpoint failed, trying /strict');
        
        // Fallback 2: Try just /strict
        try {
          tokens = await fetchTokens('/strict');
          console.log(`[Token Fetch] Fallback: got ${tokens.length} verified tokens from /strict`);
        } catch (strictError) {
          console.error('[Token Fetch] All endpoints failed, using cache or fallback');
          if (tokenCache.length > 0) {
            console.log('[Token Fetch] Returning stale cache data');
            return NextResponse.json(tokenCache);
          }
          // Last resort: use fallback tokens
          return NextResponse.json(fallbackTokens.map(token => ({ ...token, verified: false })), { status: 200 });
        }
      }
    }

    tokenCache = tokens;
    cacheTimestamp = Date.now();
    
    console.log(`[Token Cache] 💾 Cached ${tokens.length} tokens successfully`);
    console.log(`[Token Cache] Cache timestamp: ${new Date(cacheTimestamp).toISOString()}`);
    
    // Final verification of test tokens in cache
    const testAddresses = [
      '6gKwSpW4ZA92A1an7n6c6M68LgBnqtrF6kP4jhJGpump',
      'EySMjHcfK2n7npbLZ4JSZDWEje11ZTu1XzeNNkNfpump',
      'BgtsqbPo9an7F5RmEmDjj8HzufgRpZjYQLG5FZ3Dpump',
      'ASVp6k9w4QwBCTibGGSf9qbdti4uJx2Wnqf6Fxorpump'
    ];
    
    const testTokensInCache = tokens.filter(token => 
      testAddresses.includes(token.address)
    );
    
    if (testTokensInCache.length > 0) {
      console.log(`[Token Cache] ✅ ${testTokensInCache.length} test tokens found in final cache:`, 
        testTokensInCache.map(t => `${t.symbol} (${t.address})`));
    } else {
      console.log(`[Token Cache] ❌ No test tokens found in final cache`);
    }
    
    return NextResponse.json(tokens);
  } catch (e) {
    if (axios.isCancel(e)) {
      console.warn('[Token Fetch] Request cancelled by client (strict endpoint or final process).');
      return NextResponse.json(tokenCache.length ? tokenCache : [], { status: 200 });
    }
    console.error('[Token Fetch Error]', e);
    return NextResponse.json(tokenCache.length ? tokenCache : fallbackTokens, { status: 200 });
  }
}