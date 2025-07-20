import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import axiosRetry from 'axios-retry';
import fallbackTokens from '@/config/fallbackTokens.json';

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic';
export const revalidate = 0;

const JUPITER_BASE_URL = 'https://token.jup.ag';
const CACHE_DURATION = 5 * 60 * 1000;
let tokenCache: any[] = [];
let cacheTimestamp = 0;

const client = axios.create({
  baseURL: JUPITER_BASE_URL,
  timeout: 20000,
  headers: {
    'Accept-Encoding': 'gzip, deflate, br',
    Accept: 'application/json',
  },
});

axiosRetry(client, {
  retries: 3,
  retryDelay: axiosRetry.exponentialDelay,
  retryCondition: axiosRetry.isNetworkOrIdempotentRequestError,
});

const resolveIpfs = (uri: string): string => {
  if (!uri) return '/token-fallback.png';
  if (uri.startsWith('ipfs://')) return `https://ipfs.io/ipfs/${uri.slice(7)}`;
  return uri;
};

export async function GET(request: NextRequest) {
  if (tokenCache.length && Date.now() - cacheTimestamp < CACHE_DURATION) {
    return NextResponse.json(tokenCache);
  }

  try {
    const fetchTokens = async (path: string) => {
      const res = await client.get(path, { signal: request.signal });
      return (res.data || [])
        .filter((t: any) => t.chainId === 101 && t.address && t.symbol && t.name)
        .slice(0, 1000)
        .map((t: any) => ({
          address: t.address,
          name: t.name,
          symbol: t.symbol,
          decimals: t.decimals,
          logoURI: resolveIpfs(t.logoURI),
          price: t.priceUsd ? parseFloat(t.priceUsd) : undefined,
        }));
    };

    let tokens;
    try {
      tokens = await fetchTokens('/all');
    } catch (error) {
      if (axios.isCancel(error)) {
        console.warn('[Token Fetch] Request cancelled by client (all endpoint).');
        return NextResponse.json(tokenCache.length ? tokenCache : [], { status: 200 });
      }
      tokens = await fetchTokens('/strict');
    }

    tokenCache = tokens;
    cacheTimestamp = Date.now();
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