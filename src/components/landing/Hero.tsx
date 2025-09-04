"use client";
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { FiArrowDown, FiRefreshCw, FiDollarSign, FiZap } from "react-icons/fi";
import WaitlistModal from "./WaitlistModal";

export default function Hero() {
  const [showWaitlistModal, setShowWaitlistModal] = useState(false);
  // Deterministic particles to avoid SSR/CSR style mismatch
  // Simple seeded RNG (mulberry32)
  function rng(seed: number) {
    return function () {
      let t = (seed += 0x6D2B79F5);
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  const particles = useMemo(() => {
    const rand = rng(42);
    return Array.from({ length: 30 }).map((_, i) => {
      const left = `${Math.floor(rand() * 10000) / 100}%`;
      const top = `${Math.floor(rand() * 10000) / 100}%`;
      const size = 2 + Math.floor(rand() * 300) / 100; // 2 - 5 px
      const color = i % 3 === 0 ? '#facc15' : i % 3 === 1 ? '#3b82f6' : '#8b5cf6';
      const dx = Math.floor((rand() * 20 - 10) * 100) / 100; // -10 to 10
      const duration = 4 + Math.floor(rand() * 300) / 100; // 4 - 7
      const delay = Math.floor(rand() * 300) / 100; // 0 - 3
      return { left, top, size, color, dx, duration, delay, key: i };
    });
  }, []);
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-black min-h-screen flex items-center overflow-x-hidden">
      {/* Cosmic grid background */}
      <div className="absolute inset-0 z-0">
        {/* Enhanced cosmic grid with brighter Web3 aesthetic */}
        <motion.div
          className="absolute inset-0 opacity-20 dark:opacity-40"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 2 }}
        >
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice">
            <defs>
              <pattern id="cosmic-grid" x="0" y="0" width="4" height="4" patternUnits="userSpaceOnUse">
                <path d="M 4 0 L 0 0 0 4" fill="none" stroke="#facc15" strokeWidth="0.08" opacity="0.6"/>
                <circle cx="0" cy="0" r="0.12" fill="#facc15" opacity="0.8"/>
                <circle cx="4" cy="4" r="0.1" fill="#3b82f6" opacity="0.6"/>
              </pattern>
              <radialGradient id="cosmic-glow" cx="50%" cy="50%" r="60%">
                <stop offset="0%" stopColor="#facc15" stopOpacity="0.2"/>
                <stop offset="50%" stopColor="#3b82f6" stopOpacity="0.1"/>
                <stop offset="100%" stopColor="#facc15" stopOpacity="0"/>
              </radialGradient>
              <filter id="glow">
                <feGaussianBlur stdDeviation="0.2" result="coloredBlur"/>
                <feMerge> 
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>
            <rect width="100%" height="100%" fill="url(#cosmic-grid)"/>
            <circle cx="25%" cy="25%" r="15" fill="url(#cosmic-glow)" filter="url(#glow)"/>
            <circle cx="75%" cy="75%" r="12" fill="url(#cosmic-glow)" filter="url(#glow)"/>
            {/* Solana-inspired connection lines */}
            <path d="M 15 10 Q 25 8 40 15 T 65 18" stroke="#facc15" strokeWidth="0.15" opacity="0.3" fill="none" filter="url(#glow)"/>
            <path d="M 8 20 Q 22 18 35 25 T 60 30" stroke="#3b82f6" strokeWidth="0.1" opacity="0.4" fill="none"/>
          </svg>
        </motion.div>

        {/* Enhanced floating particles with Web3 feel */}
        <div className="absolute inset-0">
          {particles.map((p) => (
            <motion.div
              key={p.key}
              className="absolute rounded-full"
              style={{
                left: p.left,
                top: p.top,
                width: `${p.size}px`,
                height: `${p.size}px`,
                background: p.color,
                opacity: 0.6,
                boxShadow: '0 0 6px currentColor',
              }}
              animate={{
                y: [0, -30, 0],
                x: [0, p.dx, 0],
                opacity: [0.3, 0.9, 0.3],
                scale: [1, 1.2, 1],
              }}
              transition={{
                duration: p.duration,
                repeat: Infinity,
                delay: p.delay,
                ease: "easeInOut",
              }}
            />
          ))}
        </div>

        {/* Brighter animated gradient circles */}
        <motion.div
          className="absolute top-20 left-10 w-96 h-96 bg-yellow-500/10 dark:bg-yellow-500/20 rounded-full blur-3xl"
          animate={{ scale: [1, 1.3, 1], opacity: [0.08, 0.2, 0.08] }}
          transition={{ duration: 8, repeat: Infinity, repeatType: "reverse" }}
        />
        <motion.div
          className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-blue-500/8 dark:bg-blue-500/15 rounded-full blur-3xl"
          animate={{ scale: [1, 1.2, 1], opacity: [0.06, 0.15, 0.06] }}
          transition={{ duration: 10, repeat: Infinity, repeatType: "reverse" }}
        />
        
        {/* Enhanced polygon mesh */}
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice" fill="none" xmlns="http://www.w3.org/2000/svg">
          <polygon points="0,75 25,85 60,80 85,90 100,75 100,100 0,100" fill="#facc15" fillOpacity="0.08" />
          <polygon points="0,50 20,65 70,60 100,65 100,100 0,100" fill="#3b82f6" fillOpacity="0.06" />
        </svg>
      </div>

      <div className="container mx-auto px-4 py-8 md:py-16 flex flex-col md:flex-row items-center relative z-10 gap-8 md:gap-12 min-h-screen md:min-h-0">
        <motion.div
          className="md:w-1/2 mb-8 md:mb-0"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <motion.h1
            className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <span className="text-yellow-600 dark:text-yellow-500">FrenzySwap</span> - Premier Solana DEX Aggregator
          </motion.h1>

          <motion.p
            className="text-xl text-gray-700 dark:text-gray-300 mb-8 max-w-2xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            Trade Solana meme tokens with the best rates. Powered by Jupiter Protocol for optimal swap prices and lightning-fast transactions.
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <Link href="/login">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-3 px-6 rounded-lg text-center transition duration-300 flex items-center"
              >
                <FiZap className="mr-2" />
                Launch Swap
              </motion.div>
            </Link>
            <motion.button
              onClick={() => setShowWaitlistModal(true)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-900 dark:text-white font-bold py-3 px-6 rounded-lg transition duration-300 flex items-center justify-center gap-2 border-yellow-600 dark:border-yellow-500 border"
            >
              <FiDollarSign />
              <span>Join Waitlist</span>
            </motion.button>
          </motion.div>

          {/* Stats row */}
          <motion.div
            className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            {[
              { value: "1.2M", label: "Daily Volume" },
              { value: "24K", label: "Active Users" },
              { value: "5.2M", label: "$MEME Burned" },
              { value: "0.3%", label: "Avg. Fee" },
            ].map((stat, index) => (
              <div key={index} className="bg-white/80 dark:bg-gray-800/50 p-4 rounded-lg backdrop-blur border border-gray-200/50 dark:border-gray-700/50">
                <div className="text-xl font-bold text-yellow-600 dark:text-yellow-500">
                  {stat.value}
                </div>
                <div className="text-gray-600 dark:text-gray-400 text-sm">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </motion.div>

        <div className="md:w-1/2 flex justify-center">
          {/* Responsive swap interface image */}
          <div className="w-full max-w-xl flex justify-center items-center">
            <div className="block md:hidden w-full">
              <Image
                src="/assets/frenzy-mobile.png"
                alt="FrenzySwap Mobile Interface"
                width={420}
                height={780}
                className="rounded-2xl shadow-2xl w-full h-auto object-contain"
                priority
              />
            </div>
            <div className="hidden md:block w-full">
              <Image
                src="/assets/frenzy-desktop.png"
                alt="FrenzySwap Desktop Interface"
                width={800}
                height={800}
                className="rounded-2xl shadow-2xl w-full h-auto object-contain"
                priority
              />
            </div>
          </div>
        </div>
      </div>

      {/* Waitlist Modal */}
      <WaitlistModal 
        isOpen={showWaitlistModal} 
        onClose={() => setShowWaitlistModal(false)} 
      />
    </section>
  );
}
