"use client";

import { CheckBadgeIcon, ExclamationTriangleIcon } from '@heroicons/react/24/solid';
import { Token } from '@/config/tokens';

interface TokenVerificationBadgeProps {
  token: Token;
  size?: 'sm' | 'md' | 'lg';
}

export default function TokenVerificationBadge({ token, size = 'sm' }: TokenVerificationBadgeProps) {
  const isVerified = token.verified === true;
  const isFromDexScreener = token.isFromDexScreener === true;
  
  if (isVerified) {
    const iconSize = size === 'sm' ? 'h-4 w-4' : size === 'md' ? 'h-5 w-5' : 'h-6 w-6';
    return (
      <div 
        className="inline-flex items-center"
        title="Verified by Jupiter"
      >
        <CheckBadgeIcon className={`${iconSize} text-green-500`} />
      </div>
    );
  }
  
  // Jupiter fallback token - swappable but not in verified lists
  if (token.isJupiterFallback) {
    const iconSize = size === 'sm' ? 'h-4 w-4' : size === 'md' ? 'h-5 w-5' : 'h-6 w-6';
    return (
      <div 
        className="inline-flex items-center"
        title="Jupiter-supported but unverified token"
      >
        <ExclamationTriangleIcon className={`${iconSize} text-orange-500`} />
      </div>
    );
  }
  
  if (isFromDexScreener) {
    const iconSize = size === 'sm' ? 'h-4 w-4' : size === 'md' ? 'h-5 w-5' : 'h-6 w-6';
    return (
      <div 
        className="inline-flex items-center"
        title="Unverified token from DexScreener"
      >
        <ExclamationTriangleIcon className={`${iconSize} text-yellow-500`} />
      </div>
    );
  }
  
  // Unverified but from Jupiter
  if (token.verified === false) {
    const iconSize = size === 'sm' ? 'h-4 w-4' : size === 'md' ? 'h-5 w-5' : 'h-6 w-6';
    return (
      <div 
        className="inline-flex items-center"
        title="Unverified token"
      >
        <ExclamationTriangleIcon className={`${iconSize} text-orange-500`} />
      </div>
    );
  }
  
  // No verification data
  return null;
}
