// Advanced Token Image CDN Strategy
// src/lib/tokenImageOptimization.ts

export interface TokenImageConfig {
  src: string;
  symbol?: string;
  size?: 'sm' | 'md' | 'lg';
}

// Multi-tier CDN strategy for maximum performance
const IMAGE_PROVIDERS = {
  // Primary: Local assets for top tokens (fastest)
  local: {
    SOL: '/assets/tokens/sol.webp',
    USDC: '/assets/tokens/usdc.webp', 
    USDT: '/assets/tokens/usdt.webp',
    MEME: '/assets/tokens/meme.webp',
    BTC: '/assets/tokens/btc.webp',
    ETH: '/assets/tokens/eth.webp',
  } as Record<string, string>,
  
  // Secondary: Jupiter token images (cached, optimized)
  jupiter: (uri: string) => {
    if (!uri || uri === 'undefined') return null;
    if (uri.startsWith('ipfs://')) {
      // Use Jupiter's IPFS gateway (faster than public gateways)
      return `https://static.jup.ag/ipfs/${uri.slice(7)}`;
    }
    return uri;
  },
  
  // Tertiary: CoinGecko (high quality, slow)
  coingecko: (symbol: string) => 
    `https://assets.coingecko.com/coins/images/small/${symbol.toLowerCase()}.png`,
  
  // Quaternary: GitHub token list (reliable backup)
  github: (address: string) => 
    `https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/${address}/logo.png`,
  
  // Fallback: Generated placeholder
  placeholder: (symbol: string) => `/api/token-placeholder?symbol=${symbol}`
};

// Size optimization based on use case
const SIZE_PRESETS = {
  sm: { width: 24, height: 24, quality: 75 },
  md: { width: 48, height: 48, quality: 85 },
  lg: { width: 96, height: 96, quality: 95 }
};

export function getOptimizedTokenImage(config: TokenImageConfig): string[] {
  const { src, symbol, size = 'md' } = config;
  const sources: string[] = [];
  
  // 1. Check local assets first (WebP format for 30% smaller size)
  if (symbol && IMAGE_PROVIDERS.local[symbol.toUpperCase()]) {
    sources.push(IMAGE_PROVIDERS.local[symbol.toUpperCase()]);
  }
  
  // 2. Jupiter optimized source
  const jupiterSrc = IMAGE_PROVIDERS.jupiter(src);
  if (jupiterSrc) {
    // Add size optimization query params
    const preset = SIZE_PRESETS[size];
    sources.push(`${jupiterSrc}?w=${preset.width}&h=${preset.height}&q=${preset.quality}`);
  }
  
  // 3. CoinGecko fallback for popular tokens
  if (symbol) {
    sources.push(IMAGE_PROVIDERS.coingecko(symbol));
  }
  
  // 4. GitHub token list fallback
  if (src.includes('mainnet/')) {
    const address = src.split('mainnet/')[1]?.split('/')[0];
    if (address) {
      sources.push(IMAGE_PROVIDERS.github(address));
    }
  }
  
  // 5. Fallback placeholder
  sources.push(`/token-fallback.png`);
  
  return sources;
}

// Preload critical token images for instant display
export function preloadCriticalTokens() {
  const criticalTokens = ['SOL', 'USDC', 'USDT', 'MEME'];
  
  criticalTokens.forEach(symbol => {
    if (IMAGE_PROVIDERS.local[symbol]) {
      const img = new Image();
      img.src = IMAGE_PROVIDERS.local[symbol];
    }
  });
}

// Background image cache warming
export function warmImageCache(tokens: Array<{address: string, symbol: string, logoURI: string}>) {
  const worker = new Worker('/workers/image-cache-worker.js');
  worker.postMessage({ tokens: tokens.slice(0, 100) }); // Warm first 100 tokens
}
