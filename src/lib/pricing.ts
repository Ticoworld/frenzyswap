// src/lib/pricing.ts
import { Token } from '@/config/tokens';

interface TokenPrice {
  [address: string]: {
    price: number;
    timestamp: number;
  };
}

// Price cache to avoid excessive API calls
const priceCache: TokenPrice = {};
const CACHE_DURATION = 60000; // 1 minute cache

// Common token addresses for price lookup
const TOKEN_ADDRESSES = {
  'SOL': 'So11111111111111111111111111111111111111112',
  'USDC': 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
  'USDT': 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB',
  'MEME': process.env.NEXT_PUBLIC_MEME_TOKEN_ADDRESS || '94fzsMkuHAuFP4J8iMZS43euWr2CLtuvwLgyjPHyqcnY',
};

// Get token price from Jupiter's price API
export async function getTokenPrice(tokenAddress: string): Promise<number> {
  // Check cache first
  const cached = priceCache[tokenAddress];
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.price;
  }

  try {
    // Special case for stablecoins
    if (tokenAddress === TOKEN_ADDRESSES.USDC || tokenAddress === TOKEN_ADDRESSES.USDT) {
      const price = 1.0;
      priceCache[tokenAddress] = { price, timestamp: Date.now() };
      return price;
    }

    console.log(`[Pricing] 🔄 Fetching price for ${tokenAddress}...`);

    // Try Jupiter Price API first (via our proxy to avoid CORS/DNS issues)
    let response;
    try {
      response = await fetch(
        `/api/price?ids=${tokenAddress}`,
        {
          headers: {
            'Accept': 'application/json',
          },
          signal: AbortSignal.timeout(10000), // 10 second timeout
        }
      );

      if (response.ok) {
        const data = await response.json();
        console.log(`[Pricing] 📊 Price API response:`, data);
        
        const price = data.data?.[tokenAddress]?.price || 0;
        
        if (price > 0) {
          // Cache the result
          priceCache[tokenAddress] = { price, timestamp: Date.now() };
          console.log(`[Pricing] ✅ ${tokenAddress}: $${price}`);
          return price;
        }
      }
    } catch (proxyError) {
      console.warn(`[Pricing] ⚠️ Price API failed:`, proxyError);
    }

    // Fallback: Try CoinGecko for well-known tokens
    if (tokenAddress === TOKEN_ADDRESSES.SOL) {
      try {
        const cgResponse = await fetch(
          'https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd',
          {
            headers: { 'Accept': 'application/json' },
            signal: AbortSignal.timeout(5000),
          }
        );
        
        if (cgResponse.ok) {
          const cgData = await cgResponse.json();
          const solPrice = cgData.solana?.usd || 0;
          
          if (solPrice > 0) {
            priceCache[tokenAddress] = { price: solPrice, timestamp: Date.now() };
            console.log(`[Pricing] ✅ SOL (CoinGecko): $${solPrice}`);
            return solPrice;
          }
        }
      } catch (cgError) {
        console.warn(`[Pricing] ⚠️ CoinGecko fallback failed:`, cgError);
      }
    }

    // Final fallback for unknown/new tokens
    console.warn(`[Pricing] ❌ All price sources failed for ${tokenAddress}, using $0`);
    return 0;

  } catch (error) {
    console.error(`[Pricing] ❌ Error fetching price for ${tokenAddress}:`, error);
    return 0;
  }
}

// Get prices for multiple tokens at once
export async function getTokenPrices(tokenAddresses: string[]): Promise<Record<string, number>> {
  try {
    console.log(`[Pricing] 🔄 Fetching prices for:`, tokenAddresses);
    
    // Remove duplicates and filter unique addresses
    const uniqueAddresses = [...new Set(tokenAddresses.filter(Boolean))];
    console.log(`[Pricing] 🧹 Unique addresses:`, uniqueAddresses);
    
    // Filter out cached prices and only fetch uncached ones
    const uncachedAddresses = uniqueAddresses.filter(address => {
      const cached = priceCache[address];
      return !cached || Date.now() - cached.timestamp >= CACHE_DURATION;
    });

    // Handle stablecoins separately
    const stablecoins = [TOKEN_ADDRESSES.USDC, TOKEN_ADDRESSES.USDT];
    const stablecoinPrices: Record<string, number> = {};
    stablecoins.forEach(address => {
      if (uniqueAddresses.includes(address)) {
        stablecoinPrices[address] = 1.0;
        priceCache[address] = { price: 1.0, timestamp: Date.now() };
      }
    });

    // Get cached prices
    const cachedPrices: Record<string, number> = {};
    uniqueAddresses.forEach(address => {
      const cached = priceCache[address];
      if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        cachedPrices[address] = cached.price;
      }
    });

    // Fetch uncached prices (excluding stablecoins)
    const uncachedNonStablecoins = uncachedAddresses.filter(
      address => !stablecoins.includes(address)
    );

    let fetchedPrices: Record<string, number> = {};
    
    if (uncachedNonStablecoins.length > 0) {
      console.log(`[Pricing] 🌐 Fetching from Jupiter API:`, uncachedNonStablecoins);
      
      // Try batch fetch first (via our proxy)
      try {
        const response = await fetch(
          `/api/price?ids=${uncachedNonStablecoins.join(',')}`,
          {
            headers: {
              'Accept': 'application/json',
            },
            signal: AbortSignal.timeout(8000), // 8 second timeout
          }
        );

        if (response.ok) {
          const data = await response.json();
          console.log(`[Pricing] 📊 Batch API response:`, data);
          
          uncachedNonStablecoins.forEach(address => {
            const price = data.data?.[address]?.price || 0;
            fetchedPrices[address] = price;
            priceCache[address] = { price, timestamp: Date.now() };
          });
        } else {
          console.warn(`[Pricing] ⚠️ Batch API failed with status: ${response.status}`);
          throw new Error(`HTTP ${response.status}`);
        }
      } catch (batchError) {
        console.warn(`[Pricing] ⚠️ Batch fetch failed, trying individual requests:`, batchError);
        
        // Fallback: Fetch each token individually
        for (const address of uncachedNonStablecoins) {
          try {
            const price = await getTokenPrice(address);
            fetchedPrices[address] = price;
          } catch (individualError) {
            console.warn(`[Pricing] ⚠️ Individual fetch failed for ${address}:`, individualError);
            fetchedPrices[address] = 0;
          }
        }
      }
    }

    // Combine all prices
    const allPrices = {
      ...stablecoinPrices,
      ...cachedPrices,
      ...fetchedPrices,
    };

    console.log(`[Pricing] 💰 Final prices:`, allPrices);
    return allPrices;

  } catch (error) {
    console.error('[Pricing] ❌ Error fetching multiple prices:', error);
    
    // Emergency fallback: try individual requests for all tokens
    const fallbackPrices: Record<string, number> = {};
    for (const address of tokenAddresses) {
      if (address) {
        try {
          fallbackPrices[address] = await getTokenPrice(address);
        } catch {
          fallbackPrices[address] = 0;
        }
      }
    }
    return fallbackPrices;
  }
}

// Calculate USD value for a token amount
export function calculateUsdValue(amount: number, price: number, decimals: number = 6): number {
  if (!price || !amount) return 0;
  
  // Convert from token units to actual amount
  const actualAmount = amount / Math.pow(10, decimals);
  return actualAmount * price;
}

// Get token address from symbol/token object
export function getTokenAddress(token: Token | string): string {
  if (typeof token === 'string') {
    return TOKEN_ADDRESSES[token as keyof typeof TOKEN_ADDRESSES] || token;
  }
  return token.address;
}
