// src/components/layout/Header.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import WalletButton from "@/components/ui/WalletButton";
import { motion } from "framer-motion";
import { HiMenu, HiX } from "react-icons/hi";
import { useState, useEffect } from "react"; // <--- Import useEffect

const navItems = [
  { path: "/", label: "Home" },
  { path: "/swap", label: "Swap" },
  { path: "/nfts", label: "NFTs" },
  { path: "/staking", label: "Staking" },
  { path: "/dao", label: "DAO" },
];

export default function Header() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isClient, setIsClient] = useState(false); // <--- New state for client-side rendering

  useEffect(() => {
    // This effect runs only once after the component mounts on the client
    setIsClient(true);
  }, []);

  return (
    <header className="sticky top-0 z-50 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              {/* Large screen logo */}
              <img
                src="/assets/logos/Frenzyswap.svg"
                alt="FrenzySwap Logo"
                className="h-10 w-auto hidden md:block"
              />
              {/* Small screen logo */}
              <img
                src="/assets/logos/frenzyswap_logomark.svg"
                alt="FrenzySwap Logo"
                className="h-10 w-auto md:hidden"
              />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                href={item.path}
                className={`relative px-4 py-2 rounded-lg transition-colors ${
                  pathname === item.path
                    ? "text-yellow-600 dark:text-yellow-500"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                }`}
              >
                {item.label}
                {pathname === item.path && (
                  <motion.div
                    layoutId="navigation-underline"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-yellow-600 dark:bg-yellow-500"
                    initial={false}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
              </Link>
            ))}
          </nav>

          {/* Wallet Button & Mobile Menu Toggle */}
          <div className="flex items-center space-x-4">
            {/* Render WalletButton only if on the client-side */}
            {isClient && (
              <WalletButton className="hidden md:block" />
            )}

            {/* Mobile Menu Button (hydration-safe for icons) */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              aria-label="Toggle mobile menu" // <--- Added for accessibility
            >
              {/* Conditionally render icons only on client */}
              {isClient ? ( // <--- Use isClient for conditional rendering
                mobileMenuOpen ? (
                  <HiX className="h-6 w-6" />
                ) : (
                  <HiMenu className="h-6 w-6" />
                )
              ) : (
                // Render a placeholder on the server to prevent mismatch
                // A simple span or div that occupies space without specific content
                <span className="block h-6 w-6" /> 
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {/* Only render mobile menu content if it's open AND on the client */}
        {mobileMenuOpen && isClient && ( // <--- Add isClient check here
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden py-4 border-t border-gray-200 dark:border-gray-800"
          >
            <div className="flex flex-col space-y-2">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  href={item.path}
                  className={`px-4 py-3 rounded-lg transition-colors ${
                    pathname === item.path
                      ? "bg-gray-100 dark:bg-gray-800 text-yellow-600 dark:text-yellow-500"
                      : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white"
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
              <div className="px-4 pt-2">
                {/* Render WalletButton in mobile menu only on client */}
                <WalletButton className="w-full" /> 
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </header>
  );
}