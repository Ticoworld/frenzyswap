// src/components/layout/Header.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import WalletButton from "@/components/ui/WalletButton";
import { motion } from "framer-motion";
import { HiMenu, HiX } from "react-icons/hi";
import { useState, useEffect } from "react";

const navItems = [
  { path: "/", label: "Home" },
  { path: "/swap", label: "Swap" },
  { path: "/analytics", label: "Analytics" },
  { path: "/portfolio", label: "Portfolio" },
];

export default function Header() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <header className="sticky top-0 z-50 bg-black/60 backdrop-blur-xl border-b-2 border-brand-purple/10">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center group">
              {/* Large screen logo */}
              <img
                src="/assets/logos/Frenzyswap.svg"
                alt="FrenzySwap Logo"
                className="h-10 w-auto hidden md:block transition-opacity group-hover:opacity-80"
              />
              {/* Small screen logo */}
              <img
                src="/frenzyswap_logomark.svg"
                alt="FrenzySwap Logo"
                className="h-10 w-auto md:hidden transition-opacity group-hover:opacity-80"
              />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                href={item.path}
                className={`relative px-4 py-2 rounded-card text-body-md font-medium transition-all duration-300 ${
                  pathname === item.path
                    ? "text-brand-purple"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                {item.label}
                {pathname === item.path && (
                  <motion.div
                    layoutId="navigation-underline"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-brand-purple to-brand-blue rounded-full"
                    initial={false}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
              </Link>
            ))}
          </nav>

          {/* Wallet Button & Mobile Menu Toggle */}
          <div className="flex items-center space-x-4">
            {isClient && (
              <WalletButton className="hidden md:block" />
            )}

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden text-gray-400 hover:text-white transition-colors"
              aria-label="Toggle mobile menu"
            >
              {isClient ? (
                mobileMenuOpen ? (
                  <HiX className="h-6 w-6" />
                ) : (
                  <HiMenu className="h-6 w-6" />
                )
              ) : (
                <span className="block h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && isClient && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden py-4 border-t border-white/10"
          >
            <div className="flex flex-col space-y-2">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  href={item.path}
                  className={`px-4 py-3 rounded-card text-body-md font-medium transition-all duration-300 ${
                    pathname === item.path
                      ? "bg-brand-purple/10 text-brand-purple border border-brand-purple/30"
                      : "text-gray-400 hover:bg-white/5 hover:text-white"
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
              <div className="px-4 pt-2">
                <WalletButton className="w-full" />
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </header>
  );
}