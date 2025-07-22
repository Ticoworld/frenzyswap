import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import GlobalLoader from "@/components/ui/Loader";
import RouteLoader from "@/components/ui/RouteLoader";
import Providers from "./providers";
import StructuredData from "@/components/common/StructuredData";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "FrenzySwap | Premier Solana DEX Aggregator for Meme Tokens",
  description: "Leading Solana DEX aggregator for meme tokens. Best swap rates powered by Jupiter. $MEME tokenomics with buyback & burn.",
  keywords: [
    "FrenzySwap",
    "Solana DEX",
    "meme tokens",
    "DEX aggregator", 
    "Jupiter",
    "MEME token",
    "Solana trading",
    "DeFi",
    "cryptocurrency",
    "token swap",
    "Solana ecosystem",
    "decentralized exchange"
  ],
  authors: [{ name: "FrenzySwap Team" }],
  creator: "FrenzySwap",
  publisher: "FrenzySwap",
  metadataBase: new URL('https://www.frenzyswap.com'),
  alternates: {
    canonical: 'https://www.frenzyswap.com',
  },
  openGraph: {
    title: "FrenzySwap | Premier Solana DEX Aggregator",
    description: "Trade meme tokens on Solana with the best rates. Powered by Jupiter aggregation with $MEME tokenomics.",
    url: 'https://www.frenzyswap.com',
    siteName: 'FrenzySwap',
    type: 'website',
    locale: 'en_US',
    images: [
      {
        url: '/assets/frenzy-desktop.png',
        width: 1200,
        height: 630,
        alt: 'FrenzySwap DEX Interface',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: "FrenzySwap | Premier Solana DEX Aggregator",
    description: "Trade meme tokens on Solana with the best rates. Powered by Jupiter aggregation.",
    images: ['/assets/frenzy-desktop.png'],
    creator: '@FrenzySwap',
    site: '@FrenzySwap',
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'tZ2akjagY2P18ftTb_cyRKWwmmmg1NnTBsVmcXfYL2M', 
  },
  
  category: 'DeFi',
  classification: 'Decentralized Finance',
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-32x32.png",
    apple: "/favicon-16x16.png",
  },
}; 

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <StructuredData />
      </head>
      <body className={`${inter.className} bg-gray-900 text-white`}>
        <Providers>
          <GlobalLoader />
          <RouteLoader />
          {children}
        </Providers>
      </body>
    </html>
  );
}
