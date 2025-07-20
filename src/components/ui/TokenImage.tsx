import { useState, useMemo } from 'react';

interface TokenIconProps {
  src: string;
  alt: string;
  symbol?: string;
  className?: string;
}

// Map top tokens to local assets
const LOCAL_TOKEN_ICONS: Record<string, string> = {
  SOL: '/assets/tokens/sol.png',
  USDC: '/assets/tokens/usdc.png',
  USDT: '/assets/tokens/usdt.png',
  MEME: '/assets/tokens/meme.png',
};

function sanitizeLogoURI(uri: string, symbol?: string): string {
  const key = symbol ? symbol.toUpperCase() : undefined;
  if (!uri || uri === 'undefined') {
    if (key && LOCAL_TOKEN_ICONS[key]) return LOCAL_TOKEN_ICONS[key];
    return '/token-fallback.png';
  }
  // Prefer local asset for top tokens
  if (key && LOCAL_TOKEN_ICONS[key]) return LOCAL_TOKEN_ICONS[key];
  // If IPFS, resolve
  if (uri.startsWith('ipfs://')) return `https://ipfs.io/ipfs/${uri.slice(7)}`;
  return uri;
}

export default function TokenIcon({ src, alt, symbol, className = '' }: TokenIconProps) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const sanitizedSrc = useMemo(() => (
    error ? '/token-fallback.png' : sanitizeLogoURI(src, symbol)
  ), [error, src, symbol]);

  return (
    <div className={`relative ${className}`}>
      {!loaded && !error && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse rounded-full" />
      )}
      <img
        src={sanitizedSrc}
        alt={alt}
        className={`${className} ${(!loaded || error) ? 'invisible' : 'visible'}`}
        loading="lazy"
        decoding="async"
        onLoad={() => setLoaded(true)}
        onError={() => setError(true)}
        style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
      />
    </div>
  );
}