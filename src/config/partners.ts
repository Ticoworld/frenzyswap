export type Partner = {
  id: string;
  name: string;
  logo: string;
  // aliases used to match analytics 'project' keys (symbols or mints)
  aliases: string[];
};

// Static mapping; match by symbol aliases; extend with mints as needed
export const PARTNERS: Partner[] = [
  {
    id: 'solana',
    name: 'Solana',
    logo: '/assets/partners/solana.png',
    aliases: ['SOL', 'So11111111111111111111111111111111111111112']
  },
  {
    id: 'jupiter',
    name: 'Jupiter',
    logo: '/assets/partners/jupiter.png',
    aliases: ['JUP']
  },
  {
    id: 'raydium',
    name: 'Raydium',
    logo: '/assets/partners/raydium.png',
    aliases: ['RAY']
  },
  {
    id: 'serum',
    name: 'Serum',
    logo: '/assets/partners/serum.png',
    aliases: ['SRM']
  },
  {
    id: 'meme',
    name: 'MemeFrenzy',
    logo: '/assets/tokens/meme.png',
    aliases: ['MEME']
  },
];
