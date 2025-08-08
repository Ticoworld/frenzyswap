// src/app/api/tokens/search/route.ts
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const TOKEN_SEARCH_CACHE = new Map<string, { data: any; timestamp: number }>();
const SEARCH_CACHE_DURATION = 5 * 60 * 1000; // 5 minutes cache for searches

const resolveIpfs = (uri: string): string => {
  if (!uri) return '/token-fallback.png';
  if (uri.startsWith('ipfs://')) return `https://ipfs.io/ipfs/${uri.slice(7)}`;
  return uri;
};

const getBestLogoUri = (pair: any, baseToken: any): string => {
  // Priority order for logos - DexScreener often has better/newer logos
  const logoSources = [
    pair.info?.imageUrl,           // DexScreener specific image
    baseToken.logoURI,             // Token's own logo from metadata
    pair.baseToken?.logoURI,       // Alternative logo from pair data
    `https://dd.dexscreener.com/ds-data/tokens/solana/${baseToken.address}.png?key=da8880`, // DexScreener CDN fallback
    `https://dd.dexscreener.com/ds-data/tokens/solana/${baseToken.address}.png`, // Alternative CDN
  ].filter(Boolean);
  
  // Return first valid logo, ensuring it's a full URL
  const selectedLogo = logoSources[0];
  if (selectedLogo && !selectedLogo.startsWith('http')) {
    return `https://dd.dexscreener.com${selectedLogo}`;
  }
  
  return selectedLogo || '/token-fallback.png';
};

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const query = url.searchParams.get('q');
  
  if (!query || query.length < 32) {
    return NextResponse.json({ error: 'Invalid token address' }, { status: 400 });
  }

  // Check cache first
  const cacheKey = query.toLowerCase();
  const cached = TOKEN_SEARCH_CACHE.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < SEARCH_CACHE_DURATION) {
    console.log(`[Token Search] 📦 Returning cached result for ${query}`);
    return NextResponse.json(cached.data);
  }

  try {
    console.log(`[Token Search] 🔍 Searching DexScreener for: ${query}`);
    
    const response = await fetch(
      `https://api.dexscreener.com/latest/dex/tokens/${query}`,
      {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'FrenzySwap/1.0',
        },
        signal: AbortSignal.timeout(10000), // 10 second timeout
      }
    );

    if (!response.ok) {
      console.log(`[Token Search] ❌ DexScreener API error: ${response.status}`);
      return NextResponse.json({ error: 'Token not found' }, { status: 404 });
    }

    const data = await response.json();
    
    if (!data.pairs || data.pairs.length === 0) {
      console.log(`[Token Search] ❌ No pairs found in DexScreener for ${query}`);
      console.log(`[Token Search] 🔄 Trying Jupiter direct lookup...`);
      
      // Fallback: Try Jupiter direct quote to verify token exists
      try {
        const jupiterResponse = await fetch(
          `https://quote-api.jup.ag/v6/quote?inputMint=So11111111111111111111111111111111111111112&outputMint=${query}&amount=1000000&slippageBps=50`,
          {
            headers: {
              'Accept': 'application/json',
            },
            signal: AbortSignal.timeout(5000),
          }
        );

        if (jupiterResponse.ok) {
          const jupiterData = await jupiterResponse.json();
          if (jupiterData.outputMint === query) {
            console.log(`[Token Search] ✅ Token verified via Jupiter, fetching metadata...`);
            
            // Try to get token metadata from Solana
            let tokenMetadata = {
              symbol: `TOKEN_${query.slice(0, 8)}`,
              name: `Token ${query.slice(0, 8)}...${query.slice(-4)}`,
              decimals: 6,
              logoURI: `/token-fallback.png`,
            };

            try {
              // Try Jupiter's token list API for metadata
              const metadataResponse = await fetch(
                `https://token.jup.ag/strict`,
                { signal: AbortSignal.timeout(3000) }
              );
              
              if (metadataResponse.ok) {
                const allTokens = await metadataResponse.json();
                const tokenInfo = allTokens.find((t: any) => t.address === query);
                
                if (tokenInfo) {
                  console.log(`[Token Search] 📝 Found metadata: ${tokenInfo.symbol} - ${tokenInfo.name}`);
                  tokenMetadata = {
                    symbol: tokenInfo.symbol || tokenMetadata.symbol,
                    name: tokenInfo.name || tokenMetadata.name,
                    decimals: tokenInfo.decimals || tokenMetadata.decimals,
                    logoURI: tokenInfo.logoURI || tokenMetadata.logoURI,
                  };
                }
              }
            } catch (metaError) {
              console.log(`[Token Search] ⚠️ Metadata fetch failed, using fallback`);
            }
            
            // Create enhanced token entry
            const fallbackToken = {
              address: query,
              symbol: tokenMetadata.symbol,
              name: tokenMetadata.name,
              decimals: tokenMetadata.decimals,
              logoURI: tokenMetadata.logoURI,
              tags: ['jupiter-supported', 'unverified'],
              verified: false, // Explicitly mark as unverified
              isFromDexScreener: false,
              isJupiterFallback: true, // New flag for Jupiter fallback tokens
              daily_volume: 0,
              freeze_authority: null,
              mint_authority: null,
            };

            // Cache the result
            TOKEN_SEARCH_CACHE.set(cacheKey, { data: fallbackToken, timestamp: Date.now() });
            return NextResponse.json(fallbackToken);
          }
        }
      } catch (jupiterError) {
        console.log(`[Token Search] ❌ Jupiter lookup failed:`, jupiterError);
      }
      
      return NextResponse.json({ error: 'Token not found' }, { status: 404 });
    }

    // Find the best Solana pair (prefer Raydium, then others)
    const solanaPairs = data.pairs.filter((pair: any) => 
      pair.chainId === 'solana' && 
      pair.baseToken?.address?.toLowerCase() === query.toLowerCase()
    );

    if (solanaPairs.length === 0) {
      console.log(`[Token Search] ❌ No Solana pairs found for ${query}`);
      return NextResponse.json({ error: 'Token not found on Solana' }, { status: 404 });
    }

    // Sort by DEX preference and liquidity
    const sortedPairs = solanaPairs.sort((a: any, b: any) => {
      // Prefer Raydium
      if (a.dexId === 'raydium' && b.dexId !== 'raydium') return -1;
      if (b.dexId === 'raydium' && a.dexId !== 'raydium') return 1;
      
      // Then by liquidity
      const aLiquidity = parseFloat(a.liquidity?.usd || '0');
      const bLiquidity = parseFloat(b.liquidity?.usd || '0');
      return bLiquidity - aLiquidity;
    });

    const bestPair = sortedPairs[0];
    const baseToken = bestPair.baseToken;

    const token = {
      address: baseToken.address,
      name: baseToken.name || 'Unknown Token',
      symbol: baseToken.symbol || 'UNK',
      decimals: 6, // Default for most Solana tokens
      logoURI: getBestLogoUri(bestPair, baseToken),
      price: bestPair.priceUsd ? parseFloat(bestPair.priceUsd) : undefined,
      verified: false, // DexScreener tokens are not verified
      isFromDexScreener: true,
      tags: ['unverified'],
      dexScreenerData: {
        dexId: bestPair.dexId,
        pairAddress: bestPair.pairAddress,
        liquidity: bestPair.liquidity,
        volume24h: bestPair.volume?.h24,
        priceChange24h: bestPair.priceChange?.h24,
      }
    };

    console.log(`[Token Search] ✅ Found token: ${token.symbol} (${token.name})`);
    console.log(`[Token Search] 🖼️ Logo URL: ${token.logoURI}`);
    
    // Cache the result
    TOKEN_SEARCH_CACHE.set(cacheKey, { data: token, timestamp: Date.now() });
    
    // Clean up old cache entries periodically
    if (TOKEN_SEARCH_CACHE.size > 1000) {
      const cutoff = Date.now() - SEARCH_CACHE_DURATION;
      for (const [key, value] of TOKEN_SEARCH_CACHE.entries()) {
        if (value.timestamp < cutoff) {
          TOKEN_SEARCH_CACHE.delete(key);
        }
      }
    }

    return NextResponse.json(token);

  } catch (error) {
    console.error(`[Token Search] Error searching for ${query}:`, error);
    return NextResponse.json({ error: 'Search failed' }, { status: 500 });
  }
}
