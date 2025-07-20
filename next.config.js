/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      // IPFS/NFT storage
      {
        protocol: 'https',
        hostname: '**.ipfs.nftstorage.link',
      },
      // GitHub raw
      {
        protocol: 'https',
        hostname: 'raw.githubusercontent.com',
      },
      // Hubspot CDN
      {
        protocol: 'https',
        hostname: '424565.fs1.hubspotusercontent-na1.net',
      },
      // Google Cloud (e.g. token metadata)
      {
        protocol: 'https',
        hostname: 'storage.googleapis.com',
      },
      // Jupiter UI icons
      {
        protocol: 'https',
        hostname: 'static.jup.ag',
      },
      // General Jupiter domain wildcard
      {
        protocol: 'https',
        hostname: '**.jup.ag',
      },
      // CoinGecko token logos
      {
        protocol: 'https',
        hostname: 'assets.coingecko.com',
      },
      // Arweave for decentralized storage (common in NFTs)
      {
        protocol: 'https',
        hostname: 'arweave.net',
      },
    ],
    minimumCacheTTL: 86400,
  },
};

module.exports = nextConfig;
