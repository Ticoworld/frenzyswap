"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { FiArrowRight } from "react-icons/fi";
import MiniSwapWidget from "./MiniSwapWidget";

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-black min-h-screen flex items-center">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/assets/landing/herobg.png"
          alt=""
          fill
          className="object-cover opacity-20"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black"></div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 flex flex-col lg:flex-row items-center relative z-10 gap-16">
        <motion.div
          className="lg:w-1/2 max-w-2xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <motion.h1
            className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <span className="text-white">Best Rates on</span>
            <br />
            <span className="text-brand-purple">Solana</span>
          </motion.h1>

          <motion.p
            className="text-xl text-gray-400 mb-8 leading-relaxed max-w-xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            DEX aggregator powered by Jupiter Protocol. Swap tokens with optimal execution and lightning-fast speeds.
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row gap-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <Link href="/swap">
              <button className="bg-brand-purple hover:bg-brand-purple/90 text-white font-semibold py-4 px-8 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 w-full sm:w-auto">
                <span>Launch App</span>
                <FiArrowRight className="text-xl" />
              </button>
            </Link>
            <Link href="#features">
              <button className="bg-[#0a0a0a] hover:bg-[#111] border-2 border-gray-800 hover:border-brand-purple/50 text-white font-semibold py-4 px-8 rounded-xl transition-all duration-300 w-full sm:w-auto">
                <span>Learn More</span>
              </button>
            </Link>
          </motion.div>
        </motion.div>

        {/* Swap Widget - RIGHT SIDE */}
        <motion.div
          className="lg:w-1/2 flex justify-center lg:justify-end"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.3 }}
        >
          <MiniSwapWidget />
        </motion.div>
      </div>
    </section>
  );
}
