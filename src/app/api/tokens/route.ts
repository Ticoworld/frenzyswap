import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import axiosRetry from 'axios-retry';

import fallbackTokens from '@/config/fallbackTokens.json';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

const JUPITER_LITE_API = 'https://lite-api.jup.ag/tokens/v2';
let tokenCache: any[] = [];
let cacheTimestamp = 0;

// Well-known verified token addresses (always mark as verified)
const KNOWN_VERIFIED_TOKENS = new Set([
  'So11111111111111111111111111111111111111112', // SOL
  'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', // USDC
  'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB', // USDT
  '94fzsMkuHAuFP4J8iMZS43euWr2CLtuvwLgyjPHyqcnY', // MEME token
  'mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So', // mSOL
  'J1toso1uCk3RLmjorhTtrVwY9HJ7X8V9yYac6Y7kGCPn', // jitoSOL
  'bSo13r4TkiE4KumL71LsHTPpL2euBYLFx6h9HP3piy1', // bSOL
  'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263', // Bonk
]);

const client = axios.create({
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


const resolveLogo = (icon: string | undefined): string => {
  if (!icon) return '/token-fallback.png';
  if (icon.startsWith('ipfs://')) return `https://ipfs.io/ipfs/${icon.slice(7)}`;
  return icon;
};


export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const search = url.searchParams.get('search');
  const clearCache = url.searchParams.get('clear-cache');

  if (clearCache === 'true') {
    tokenCache = [];
    cacheTimestamp = 0;
    return NextResponse.json({ message: 'Cache cleared', success: true });
  }


  // Always fetch the verified set for cross-checking
  let verifiedSet: Set<string> = new Set();
  try {
    const verifiedRes = await axios.get(`${JUPITER_LITE_API}/tag?query=verified`);
    if (Array.isArray(verifiedRes.data)) {
      verifiedSet = new Set(verifiedRes.data.map((t: any) => t.id));
    }
  } catch {}

  // Search mode: use Jupiter's /search endpoint
  if (search) {
    try {
      const res = await axios.get(`${JUPITER_LITE_API}/search?query=${encodeURIComponent(search)}`);
      if (!Array.isArray(res.data)) throw new Error('Invalid search response');
      const results = res.data.map((t: any) => ({
        address: t.id,
        name: t.name,
        symbol: t.symbol,
        decimals: t.decimals,
        logoURI: resolveLogo(t.icon),
        verified: verifiedSet.has(t.id) || t.isVerified || KNOWN_VERIFIED_TOKENS.has(t.id),
        tags: t.tags || [],
      }));
      return NextResponse.json({ query: search, results, verifiedAddresses: Array.from(verifiedSet) });
    } catch (e) {
      // fallback to local search
      const found = fallbackTokens.filter(token =>
        token.address.toLowerCase().includes(search.toLowerCase()) ||
        token.symbol.toLowerCase().includes(search.toLowerCase()) ||
        token.name.toLowerCase().includes(search.toLowerCase())
      ).map(token => ({
        ...token,
        verified: KNOWN_VERIFIED_TOKENS.has(token.address)
      }));
      return NextResponse.json({ query: search, results: found, verifiedAddresses: Array.from(verifiedSet) });
    }
  }

  // Return cached data if fresh
  const cacheAge = Date.now() - cacheTimestamp;
  if (tokenCache.length && cacheAge < 60 * 60 * 1000) {
    return NextResponse.json(tokenCache);
  }

  // Fetch verified tokens from Jupiter V2
  try {
    const res = await axios.get(`${JUPITER_LITE_API}/tag?query=verified`);
    if (!Array.isArray(res.data)) throw new Error('Invalid tag response');
    const tokens = res.data.map((t: any) => ({
      address: t.id,
      name: t.name,
      symbol: t.symbol,
      decimals: t.decimals,
      logoURI: resolveLogo(t.icon),
      verified: true,
      tags: t.tags || [],
    }));
    tokenCache = tokens;
    cacheTimestamp = Date.now();
    return NextResponse.json({ tokens, verifiedAddresses: Array.from(verifiedSet) });
  } catch (e) {
    // fallback to local list
    return NextResponse.json({
      tokens: fallbackTokens.map(token => ({
        ...token,
        verified: KNOWN_VERIFIED_TOKENS.has(token.address)
      })),
      verifiedAddresses: Array.from(verifiedSet)
    }, { status: 200 });
  }
}