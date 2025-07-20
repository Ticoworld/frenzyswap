"use client";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { FiArrowDown, FiRefreshCw, FiDollarSign, FiZap } from "react-icons/fi";

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-gray-900 to-black min-h-screen overflow-x-hidden">
      {/* Web3-inspired animated background */}
      <motion.div
        className="absolute top-0 left-0 w-full h-full z-0"
        initial={{ opacity: 0.7 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        {/* Animated gradient circles */}
        <motion.div
          className="absolute top-20 left-10 w-80 h-80 bg-yellow-500/10 rounded-full blur-3xl"
          animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.2, 0.1] }}
          transition={{ duration: 8, repeat: Infinity, repeatType: "reverse" }}
        />
        <motion.div
          className="absolute bottom-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"
          animate={{ scale: [1, 1.1, 1], opacity: [0.08, 0.15, 0.08] }}
          transition={{ duration: 10, repeat: Infinity, repeatType: "reverse" }}
        />
        {/* Subtle polygon mesh for web3 look */}
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 1440 800" fill="none" xmlns="http://www.w3.org/2000/svg">
          <polygon points="0,600 400,700 800,650 1200,750 1440,600 1440,800 0,800" fill="#facc15" fillOpacity="0.03" />
          <polygon points="0,400 300,500 900,450 1440,500 1440,800 0,800" fill="#3b82f6" fillOpacity="0.03" />
        </svg>
      </motion.div>

      <div className="container mx-auto px-4 py-16 md:py-24 flex flex-col md:flex-row items-center relative z-10 gap-2">
        <motion.div
          className="md:w-1/2 mb-12 md:mb-0"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <motion.h1
            className="text-4xl md:text-6xl font-bold mb-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            Welcome to the <span className="text-yellow-500">MemeFrenzy</span>{" "}
            Revolution
          </motion.h1>

          <motion.p
            className="text-xl text-gray-300 mb-8 max-w-2xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            FrenzySwap is your gateway to a complete meme token experience. Swap
            your favorite meme coins and utility tokens, earn rewards...
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <Link href="/swap">
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
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-gray-800 hover:bg-gray-700 text-white font-bold py-3 px-4 rounded-lg transition duration-300 flex items-center gap-3 border-yellow-500 border"
            >
              <FiDollarSign className="" />
             <span className="text-sm">How It Works</span>
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
              <div key={index} className="bg-gray-800/50 p-4 rounded-lg">
                <div className="text-xl font-bold text-yellow-500">
                  {stat.value}
                </div>
                <div className="text-gray-400 text-sm">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </motion.div>

        <div className="md:w-1/2 flex justify-center">
          {/* Responsive swap interface image */}
          <div className="w-full flex justify-center items-center">
            <div className="block md:hidden w-full">
              <Image
                src="/assets/frenzy-mobile.png"
                alt="FrenzySwap Mobile Interface"
                width={320}
                height={600}
                className="rounded-2xl shadow-xl w-full h-auto object-contain"
                priority
              />
            </div>
            <div className="hidden md:block w-full">
              <Image
                src="/assets/frenzy-desktop.png"
                alt="FrenzySwap Desktop Interface"
                width={600}
                height={400}
                className="rounded-2xl shadow-xl w-full h-auto object-contain"
                priority
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
