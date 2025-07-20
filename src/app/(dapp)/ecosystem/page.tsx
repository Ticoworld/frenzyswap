"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { FiLayers, FiImage, FiUsers, FiTrendingUp } from "react-icons/fi";

export default function EcosystemPage() {
  return (
    <section className="min-h-screen py-16 bg-gray-900 flex items-center overflow-x-hidden">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Explore the <span className="text-yellow-500">FrenzySwap Ecosystem</span>
          </h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Discover all the features, partners, and opportunities in our growing ecosystem.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <motion.div
            whileHover={{ scale: 1.04 }}
            className="bg-gray-800 rounded-2xl p-8 flex flex-col items-center border border-gray-700"
          >
            <FiImage className="text-4xl text-yellow-500 mb-4" />
            <h3 className="text-xl font-bold mb-2">NFTs</h3>
            <p className="text-gray-300 mb-4 text-center">Collect, trade, and showcase unique digital assets.</p>
            <Link href="/nfts" className="text-yellow-500 font-bold hover:underline">Go to NFTs</Link>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.04 }}
            className="bg-gray-800 rounded-2xl p-8 flex flex-col items-center border border-gray-700"
          >
            <FiUsers className="text-4xl text-yellow-500 mb-4" />
            <h3 className="text-xl font-bold mb-2">DAO</h3>
            <p className="text-gray-300 mb-4 text-center">Participate in governance and shape the future of FrenzySwap.</p>
            <Link href="/dao" className="text-yellow-500 font-bold hover:underline">Go to DAO</Link>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.04 }}
            className="bg-gray-800 rounded-2xl p-8 flex flex-col items-center border border-gray-700"
          >
            <FiTrendingUp className="text-4xl text-yellow-500 mb-4" />
            <h3 className="text-xl font-bold mb-2">Staking</h3>
            <p className="text-gray-300 mb-4 text-center">Stake your tokens and earn rewards while supporting the ecosystem.</p>
            <Link href="/staking" className="text-yellow-500 font-bold hover:underline">Go to Staking</Link>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.04 }}
            className="bg-gray-800 rounded-2xl p-8 flex flex-col items-center border border-gray-700"
          >
            <FiLayers className="text-4xl text-yellow-500 mb-4" />
            <h3 className="text-xl font-bold mb-2">Partners</h3>
            <p className="text-gray-300 mb-4 text-center">See all the projects and protocols FrenzySwap integrates with.</p>
            <Link href="#partners" className="text-yellow-500 font-bold hover:underline">View Partners</Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
