// src/components/layout/DappHeader.tsx
'use client';

import Link from "next/link";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
// Import your custom WalletButton, not the raw one from adapter.tsx
import WalletButton from "@/components/ui/WalletButton"; // <--- Corrected import path
import { motion } from "framer-motion";
import { HiMenu, HiX } from "react-icons/hi";

const navItems = [
  { path: "/swap", label: "Swap" },
  { path: "/nfts", label: "NFTs" },
  { path: "/staking", label: "Staking" },
  { path: "/dao", label: "DAO" },
];

export function DappHeader() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  // Renamed iconMounted to isClient for broader application
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    // This effect runs only on the client-side after initial render
    setIsClient(true);
  }, []);

  return (
    <header className="bg-gray-900 border-b border-gray-800 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <img
                src="/assets/logos/Frenzyswap.svg"
                alt="FrenzySwap Logo"
                className="h-10 w-auto hidden md:block"
              />
              <img
                src="/assets/logos/frenzyswap_logomark.svg"
                alt="FrenzySwap Logo"
                className="h-10 w-auto md:hidden"
              />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                href={item.path}
                className={`relative px-4 py-2 rounded-lg transition-colors ${
                  pathname === item.path
                    ? "text-yellow-500"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                {item.label}
                {pathname === item.path && (
                  <motion.div
                    layoutId="navigation-underline"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-yellow-500"
                    initial={false}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
              </Link>
            ))}
          </nav>

          {/* Wallet Button + Mobile Toggle */}
          <div className="flex items-center space-x-4">
            {/* Render WalletButton only when on the client to prevent hydration mismatch */}
            {isClient && (
              <WalletButton className="hidden md:block bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-400 hover:to-yellow-500 text-black font-medium py-1 px-4 rounded-lg transition-all shadow-lg" />
            )}
            
            {/* Mobile Toggle Button (hydration-safe icons) */}
            <button
              onClick={() => setMobileMenuOpen((open) => !open)}
              className="md:hidden text-gray-400 hover:text-white"
              aria-label="Toggle mobile menu"
            >
              <span className="sr-only">Toggle Menu</span>
              <span className="block h-6 w-6">
                {/* Conditionally render icons only on client */}
                {isClient ? (
                  mobileMenuOpen ? <HiX className="h-6 w-6" /> : <HiMenu className="h-6 w-6" />
                ) : (
                  // Render a non-breaking space or an empty span on server
                  // This maintains the button's structure without React trying to match specific icon HTML
                  <span />
                )}
              </span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {/* Only render mobile nav content if it's open AND on the client */}
        {mobileMenuOpen && isClient && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden py-4 border-t border-gray-800"
          >
            <div className="flex flex-col space-y-2">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  href={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`px-4 py-3 rounded-lg transition-colors ${
                    pathname === item.path
                      ? "bg-gray-800 text-yellow-500"
                      : "text-gray-400 hover:bg-gray-800 hover:text-white"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
              <div className="px-4 pt-2">
                {/* Render WalletButton in mobile menu only on client */}
                <WalletButton className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-400 hover:to-yellow-500 text-black font-medium py-2 px-4 rounded-lg transition-all shadow-lg" />
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </header>
  );
}