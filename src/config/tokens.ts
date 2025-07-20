export const MEME_TOKEN_ADDRESS = process.env.NEXT_PUBLIC_MEME_TOKEN_ADDRESS || '94fzsMkuHAuFP4J8iMZS43euWr2CLtuvwLgyjPHyqcnY';

export type Token = {
  address: string;
  name: string;
  symbol: string;
  logoURI: string;
  decimals: number;
  price?: number;
}; 

export const MEME_TOKEN: Token = {
  address: MEME_TOKEN_ADDRESS,
  name: 'MemeFrenzy',
  symbol: 'MEME',
  logoURI: '/assets/tokens/meme.png',
  decimals: 6  // MEME token has 6 decimals, not 9
};

