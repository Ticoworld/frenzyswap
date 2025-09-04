// src/components/layout/DappHeader.tsx
"use client";

import Link from "next/link";
import Image from "next/image";
import dynamic from "next/dynamic";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { HiMenu, HiX } from "react-icons/hi";
// Lazy-load menus/drawer to keep initial JS small
const RewardsMenu = dynamic(() => import("@/components/navigation/RewardsMenu"), { ssr: false });
const AnalyticsMenu = dynamic(() => import("@/components/navigation/AnalyticsMenu"), { ssr: false });
const UserMenu = dynamic(() => import("@/components/navigation/UserMenu"), { ssr: false });
const MobileDrawer = dynamic(() => import("@/components/navigation/MobileDrawer"), { ssr: false });
import WalletButton from "@/components/ui/WalletButton";

export function DappHeader() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isClient, setIsClient] = useState(false);
  useEffect(() => setIsClient(true), []);

  // Auto-close mobile drawer on desktop breakpoint
  useEffect(() => {
    if (!mobileOpen) return;
    const onResize = () => {
      if (window.innerWidth >= 768) setMobileOpen(false);
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [mobileOpen]);

  const isSwap = pathname === "/" || pathname.startsWith("/swap");

  return (
    <header className="bg-white dark:bg-gray-900/95 backdrop-blur border-b border-gray-200 dark:border-gray-800 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/assets/logos/frenzyswap_logomark.svg"
              alt="FrenzySwap"
              width={40}
              height={40}
              className="md:hidden"
              priority
            />
            <Image
              src="/assets/logos/Frenzyswap.svg"
              alt="FrenzySwap"
              width={140}
              height={28}
              className="hidden md:block"
              priority
            />
          </Link>

          {/* Desktop navigation */}
          <nav className="hidden md:flex items-center gap-1">
            <Link
              href="/swap"
              className={`relative px-3 py-2 rounded-md transition-colors ${
                isSwap ? "text-yellow-600 dark:text-yellow-500" : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              Swap
              {isSwap && (
                <motion.span layoutId="nav-underline" className="absolute left-0 right-0 -bottom-px h-0.5 bg-yellow-600 dark:bg-yellow-500" />
              )}
            </Link>
            <RewardsMenu />
            <AnalyticsMenu />
            <Link href="/staking" className="px-3 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">Staking</Link>
            <Link href="/dao" className="px-3 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">DAO</Link>
          </nav>

          {/* Right side: wallet + user + mobile toggle */}
          <div className="flex items-center gap-2">
            {isClient && (
              <WalletButton className="px-4 py-2" />
            )}
            <div className="hidden md:block">
              <UserMenu />
            </div>
            <button
              onClick={() => setMobileOpen((v) => !v)}
              className="md:hidden text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white p-2"
              aria-label="Open menu"
            >
              {isClient ? (mobileOpen ? <HiX className="h-6 w-6" /> : <HiMenu className="h-6 w-6" />) : <span />}
            </button>
          </div>
        </div>
      </div>
      <MobileDrawer open={mobileOpen} onClose={() => setMobileOpen(false)} />
    </header>
  );
}