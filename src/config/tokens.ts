export const MEME_TOKEN_ADDRESS = process.env.NEXT_PUBLIC_MEME_TOKEN_ADDRESS || '94fzsMkuHAuFP4J8iMZS43euWr2CLtuvwLgyjPHyqcnY';

export type Token = {
  address: string;
  name: string;
  symbol: string;
  logoURI: string;
  decimals: number;
  price?: number;
  verified?: boolean; // Jupiter strict list verification
  tags?: string[]; // Jupiter tags (community, verified, etc.)
  isFromDexScreener?: boolean; // Flag for tokens from DexScreener (unverified)
  isJupiterFallback?: boolean; // Flag for tokens found via Jupiter fallback but not in verified lists
}; 

export const MEME_TOKEN: Token = {
  address: MEME_TOKEN_ADDRESS,
  name: 'MemeFrenzy',
  symbol: 'MEME',
  logoURI: '/assets/tokens/meme.png',
  decimals: 6,  // MEME token has 6 decimals, not 9
  verified: true,
  tags: ['verified', 'community']
};

