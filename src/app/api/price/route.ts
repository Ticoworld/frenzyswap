// src/app/api/price/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const tokenIds = searchParams.get('ids');
  
  if (!tokenIds) {
    return NextResponse.json({ error: 'Missing token IDs' }, { status: 400 });
  }

  console.log(`[Price API] 🔄 Fetching prices for: ${tokenIds}`);
  const tokenArray = tokenIds.split(',');

  try {
    // Try Jupiter API first
    try {
      const jupiterResponse = await fetch(
        `https://price.jup.ag/v6/price?ids=${tokenIds}`,
        {
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'FrenzySwap/1.0',
          },
          signal: AbortSignal.timeout(8000),
        }
      );

      if (jupiterResponse.ok) {
        const data = await jupiterResponse.json();
        console.log(`[Price API] ✅ Jupiter success:`, data);
        return NextResponse.json(data);
      }
    } catch (jupiterError) {
      console.warn(`[Price API] ⚠️ Jupiter failed:`, jupiterError);
    }

    // Fallback: Build response using alternative sources
    const fallbackData: any = { data: {} };

    // Handle SOL price via CoinGecko
    if (tokenArray.includes('So11111111111111111111111111111111111111112')) {
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
            fallbackData.data['So11111111111111111111111111111111111111112'] = { price: solPrice };
            console.log(`[Price API] ✅ SOL from CoinGecko: $${solPrice}`);
          }
        }
      } catch (cgError) {
        console.warn(`[Price API] ⚠️ CoinGecko failed:`, cgError);
      }
    }

    // Handle USDC (always $1)
    if (tokenArray.includes('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v')) {
      fallbackData.data['EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'] = { price: 1.0 };
      console.log(`[Price API] ✅ USDC: $1.00`);
    }

    // Handle USDT (always $1)
    if (tokenArray.includes('Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB')) {
      fallbackData.data['Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB'] = { price: 1.0 };
      console.log(`[Price API] ✅ USDT: $1.00`);
    }

    // For MEME and other tokens, try DexScreener as backup
    const remainingTokens = tokenArray.filter(token => 
      !['So11111111111111111111111111111111111111112', 
        'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
        'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB'].includes(token)
    );

    for (const token of remainingTokens) {
      try {
        // Try DexScreener for individual tokens
        const dexResponse = await fetch(
          `https://api.dexscreener.com/latest/dex/tokens/${token}`,
          {
            headers: { 'Accept': 'application/json' },
            signal: AbortSignal.timeout(5000),
          }
        );

        if (dexResponse.ok) {
          const dexData = await dexResponse.json();
          const pair = dexData.pairs?.[0];
          const price = parseFloat(pair?.priceUsd || '0');
          
          if (price > 0) {
            fallbackData.data[token] = { price };
            console.log(`[Price API] ✅ ${token} from DexScreener: $${price}`);
          } else {
            fallbackData.data[token] = { price: 0 };
            console.log(`[Price API] ⚠️ ${token}: No price found, using $0`);
          }
        } else {
          fallbackData.data[token] = { price: 0 };
          console.log(`[Price API] ⚠️ ${token}: DexScreener failed, using $0`);
        }
      } catch (dexError) {
        fallbackData.data[token] = { price: 0 };
        console.warn(`[Price API] ⚠️ ${token} DexScreener error:`, dexError);
      }
    }

    console.log(`[Price API] ✅ Fallback response:`, fallbackData);
    return NextResponse.json(fallbackData);

  } catch (error) {
    console.error(`[Price API] ❌ Server error:`, error);
    
    // Emergency fallback - return basic prices
    const emergencyData = {
      data: tokenArray.reduce((acc: any, token: string) => {
        if (token === 'So11111111111111111111111111111111111111112') {
          acc[token] = { price: 166 }; // Rough SOL price
        } else if (token === 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v') {
          acc[token] = { price: 1.0 }; // USDC
        } else if (token === 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB') {
          acc[token] = { price: 1.0 }; // USDT
        } else {
          acc[token] = { price: 0 }; // Unknown tokens
        }
        return acc;
      }, {})
    };
    
    return NextResponse.json(emergencyData);
  }
}
