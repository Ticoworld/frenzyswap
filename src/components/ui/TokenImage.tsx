import { useState, useMemo, useRef, useEffect } from 'react';

interface TokenImageProps {
  src: string;
  alt: string;
  symbol?: string;
  address?: string;
  className?: string;
  size?: number;
}

// Enhanced local token mapping with WebP support
const LOCAL_TOKEN_ICONS: Record<string, string> = {
  SOL: '/assets/tokens/sol.png',
  USDC: '/assets/tokens/usdc.png',
  USDT: '/assets/tokens/tether-usdt-seeklogo.png',
  MEME: '/assets/tokens/meme.png',
};

// Jupiter-style multi-tier image source strategy for maximum reliability
function getImageSources(src: string, symbol?: string, address?: string, size = 48): string[] {
  const sources: string[] = [];
  
  // 1. Local assets for top tokens (fastest - instant loading)
  if (symbol && LOCAL_TOKEN_ICONS[symbol.toUpperCase()]) {
    sources.push(LOCAL_TOKEN_ICONS[symbol.toUpperCase()]);
  }
  
  // 2. Jupiter's exact CDN strategy with wsrv.nl optimization
  if (address) {
    sources.push(`https://wsrv.nl/?w=${size}&h=${size}&url=https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/${address}/logo.png`);
    sources.push(`https://wsrv.nl/?w=${size}&h=${size}&fit=cover&url=https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/${address}/logo.png`);
  }
  
  // 3. Direct GitHub token list (Solana Labs official)
  if (address) {
    sources.push(`https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/${address}/logo.png`);
  }
  
  // 4. Original source with IPFS optimization
  if (src && src !== 'undefined') {
    if (src.startsWith('ipfs://')) {
      // Jupiter IPFS gateways (faster than public gateways)
      const ipfsHash = src.slice(7);
      sources.push(`https://ipfs.jupiter.exchange/ipfs/${ipfsHash}`);
      sources.push(`https://static.jup.ag/ipfs/${ipfsHash}`);
      sources.push(`https://ipfs.io/ipfs/${ipfsHash}`);
    } else {
      sources.push(src);
    }
  }
  
  // 5. CoinGecko alternatives
  if (address) {
    sources.push(`https://api.coingecko.com/api/v3/coins/solana/contract/${address}/image`);
    sources.push(`https://assets.coingecko.com/coins/images/solana/contract/${address}.png`);
  }
  
  // 6. CoinGecko by symbol fallback
  if (symbol) {
    sources.push(`https://assets.coingecko.com/coins/images/small/${symbol.toLowerCase()}.png`);
  }
  
  // 7. DexScreener fallback
  if (address) {
    sources.push(`https://dd.dexscreener.com/ds-data/tokens/solana/${address}.png`);
  }
  
  // 8. Final fallback
  sources.push('/token-fallback.png');
  
  return sources;
}

export default function TokenImage({ 
  src, 
  alt, 
  symbol, 
  address, 
  className = '', 
  size = 48 
}: TokenImageProps) {
  const [currentSrcIndex, setCurrentSrcIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  
  const imageSources = useMemo(() => getImageSources(src, symbol, address, size), [src, symbol, address, size]);
  const currentSrc = imageSources[currentSrcIndex] || '/token-fallback.png';
  
  // Reset when sources change
  useEffect(() => {
    setCurrentSrcIndex(0);
    setIsLoading(true);
    setHasError(false);
  }, [imageSources]);
  
  const handleLoad = () => {
    setIsLoading(false);
    setHasError(false);
  };
  
  const handleError = () => {
    if (currentSrcIndex < imageSources.length - 1) {
      // Try next source
      setCurrentSrcIndex(prev => prev + 1);
    } else {
      // All sources failed
      setIsLoading(false);
      setHasError(true);
    }
  };
  
  // Generate placeholder based on symbol
  const placeholder = symbol ? symbol.slice(0, 2).toUpperCase() : '?';
  
  return (
    <div className={`relative ${className}`}>
      {/* Loading skeleton */}
      {isLoading && (
        <div className="absolute inset-0 bg-gray-700 animate-pulse rounded-full flex items-center justify-center">
          <span className="text-xs text-gray-400 font-medium">{placeholder}</span>
        </div>
      )}
      
      {/* Fallback text when all images fail */}
      {hasError && (
        <div className="absolute inset-0 bg-gray-700 rounded-full flex items-center justify-center">
          <span className="text-xs text-white font-medium">{placeholder}</span>
        </div>
      )}
      
      {/* Actual image - using img for dynamic token images */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        ref={imgRef}
        src={currentSrc}
        alt={alt}
        className={`${className} ${isLoading || hasError ? 'opacity-0' : 'opacity-100'} transition-opacity duration-200`}
        loading="lazy"
        decoding="async"
        onLoad={handleLoad}
        onError={handleError}
        style={{ 
          maxWidth: '100%', 
          maxHeight: '100%', 
          objectFit: 'cover',
          borderRadius: 'inherit'
        }}
      />
    </div>
  );
}