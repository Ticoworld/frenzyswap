import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import GlobalLoader from "@/components/ui/Loader";
import RouteLoader from "@/components/ui/RouteLoader";
import Providers from "./providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "FrenzySwap | MemeFrenzy DEX Aggregator",
  description: "Clean, fast DEX aggregator for the MemeFrenzy ecosystem",
  icons: {
    icon: "/favicon.ico",                 // Main favicon
    shortcut: "/favicon-32x32.png",      // For Safari and modern browsers
    apple: "/favicon-16x16.png",         // Apple devices fallback
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
