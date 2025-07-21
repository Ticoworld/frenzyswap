import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import GlobalLoader from "@/components/ui/Loader";
import RouteLoader from "@/components/ui/RouteLoader";
import Providers from "./providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "FrenzySwap | Premier Solana DEX Aggregator for Meme Tokens",
  description: "FrenzySwap is the leading DEX aggregator on Solana for meme token trading. Swap tokens with the best rates, powered by Jupiter. Join the $MEME ecosystem with buyback & burn tokenomics.",
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
  metadataBase: new URL('https://frenzyswap.com'),
  alternates: {
    canonical: 'https://frenzyswap.com',
  },
  openGraph: {
    title: "FrenzySwap | Premier Solana DEX Aggregator",
    description: "Trade meme tokens on Solana with the best rates. Powered by Jupiter aggregation with $MEME tokenomics.",
    url: 'https://frenzyswap.com',
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
    google: 'your-google-verification-code', // Add your Google Search Console verification code
    // yandex: 'your-yandex-verification-code',
    // bing: 'your-bing-verification-code',
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
