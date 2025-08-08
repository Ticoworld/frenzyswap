// src/lib/fetchTokenPrices.ts
// Utility to fetch token prices by mint address from a public Solana price API (e.g., Birdeye)

export interface TokenPrice {
  mint: string;
  price: number | null;
}

/**
 * Fetches USD prices for an array of Solana token mint addresses using Birdeye public API.
 * @param mints Array of mint addresses
 * @returns Array of TokenPrice objects
 */
// Simple in-memory cache
const PRICE_CACHE: { [mint: string]: { price: number | null; timestamp: number } } = {};
const CACHE_TTL_MS = 60 * 1000; // 1 minute

export async function fetchTokenPrices(mints: string[]): Promise<TokenPrice[]> {
  if (!mints.length) return [];
  const now = Date.now();
  // Find which mints need to be fetched (not in cache or expired)
  const mintsToFetch = mints.filter((mint) => {
    const cached = PRICE_CACHE[mint];
    return !cached || now - cached.timestamp > CACHE_TTL_MS;
  });

  // Fetch prices for missing/expired mints from the /api/price route (Jupiter/CoinGecko/DexScreener fallback)
  if (mintsToFetch.length > 0) {
    try {
      const res = await fetch(`/api/price?ids=${mintsToFetch.join(',')}`);
      if (!res.ok) throw new Error('Failed to fetch token prices');
      const data = await res.json();
      // data.data is an object: { [mint]: { price: number } }
      mintsToFetch.forEach((mint) => {
        PRICE_CACHE[mint] = {
          price: data.data && data.data[mint] && typeof data.data[mint].price === 'number' ? data.data[mint].price : null,
          timestamp: now,
        };
      });
    } catch (e) {
      console.error('fetchTokenPrices error:', e);
      // Mark as failed in cache to avoid retry storm
      mintsToFetch.forEach((mint) => {
        PRICE_CACHE[mint] = { price: null, timestamp: now };
      });
    }
  }

  // Return prices from cache
  return mints.map((mint) => ({
    mint,
    price: PRICE_CACHE[mint]?.price ?? null,
  }));
}
