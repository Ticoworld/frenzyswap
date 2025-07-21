'use client';

import { motion } from 'framer-motion';
import { 
  FiRefreshCw, 
  FiImage, 
  FiLock,
  FiUsers,
  FiGift,
  FiPieChart,
  FiZap
} from 'react-icons/fi';

export default function Ecosystem() {
  return (
    <section className="min-h-screen py-16 bg-gray-800 flex items-center overflow-x-hidden relative">
      {/* Ecosystem Network Cosmic Background */}
      <div className="absolute inset-0 z-0">
        {/* Network/connection cosmic grid */}
        <motion.div
          className="absolute inset-0 opacity-25"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.25 }}
          transition={{ duration: 2 }}
        >
          <svg className="w-full h-full" viewBox="0 0 1440 800">
            <defs>
              <pattern id="ecosystem-grid" x="0" y="0" width="90" height="90" patternUnits="userSpaceOnUse">
                <path d="M 90 0 L 0 0 0 90" fill="none" stroke="#3b82f6" strokeWidth="1" opacity="0.4"/>
                <circle cx="0" cy="0" r="2.5" fill="#3b82f6" opacity="0.7"/>
                <circle cx="45" cy="45" r="1" fill="#facc15" opacity="0.6"/>
              </pattern>
              <radialGradient id="ecosystem-glow-blue" cx="50%" cy="50%" r="60%">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.15"/>
                <stop offset="100%" stopColor="#3b82f6" stopOpacity="0"/>
              </radialGradient>
              <radialGradient id="ecosystem-glow-purple" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.12"/>
                <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0"/>
              </radialGradient>
            </defs>
            <rect width="100%" height="100%" fill="url(#ecosystem-grid)"/>
            <circle cx="20%" cy="30%" r="180" fill="url(#ecosystem-glow-blue)"/>
            <circle cx="80%" cy="70%" r="200" fill="url(#ecosystem-glow-purple)"/>
            {/* Ecosystem connection network */}
            <path d="M 200 200 L 400 300 L 600 250 L 800 350 L 1000 300" stroke="#3b82f6" strokeWidth="1.5" opacity="0.4" fill="none"/>
            <path d="M 150 400 L 350 350 L 550 450 L 750 400 L 950 450" stroke="#8b5cf6" strokeWidth="1" opacity="0.4" fill="none"/>
            <path d="M 300 150 L 500 200 L 700 150 L 900 200" stroke="#facc15" strokeWidth="1" opacity="0.3" fill="none"/>
            {/* Network nodes */}
            <circle cx="400" cy="300" r="4" fill="#3b82f6" opacity="0.8"/>
            <circle cx="600" cy="250" r="3" fill="#8b5cf6" opacity="0.7"/>
            <circle cx="800" cy="350" r="3.5" fill="#facc15" opacity="0.6"/>
          </svg>
        </motion.div>

        {/* Ecosystem floating particles */}
        <div className="absolute inset-0">
          {Array.from({ length: 20 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                width: `${1.5 + Math.random() * 3}px`,
                height: `${1.5 + Math.random() * 3}px`,
                background: i % 3 === 0 ? '#3b82f6' : i % 3 === 1 ? '#8b5cf6' : '#facc15',
                opacity: 0.5,
                boxShadow: '0 0 4px currentColor',
              }}
              animate={{
                y: [0, -25, 0],
                x: [0, Math.random() * 20 - 10, 0],
                opacity: [0.3, 0.8, 0.3],
                scale: [1, 1.4, 1],
              }}
              transition={{
                duration: 5 + Math.random() * 4,
                repeat: Infinity,
                delay: Math.random() * 4,
                ease: "easeInOut",
              }}
            />
          ))}
        </div>

        {/* Enhanced gradient circles for ecosystem */}
        <motion.div
          className="absolute top-10 left-10 w-96 h-96 bg-blue-500/12 rounded-full blur-3xl"
          animate={{ scale: [1, 1.3, 1], opacity: [0.08, 0.2, 0.08] }}
          transition={{ duration: 16, repeat: Infinity, repeatType: "reverse" }}
        />
        <motion.div
          className="absolute bottom-10 right-10 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl"
          animate={{ scale: [1, 1.2, 1], opacity: [0.06, 0.18, 0.06] }}
          transition={{ duration: 18, repeat: Infinity, repeatType: "reverse" }}
        />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            The <span className="text-yellow-500">MemeFrenzy</span> Ecosystem
          </h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            More than just a swap - a complete meme token experience
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7 }}
            viewport={{ once: true }}
          >
            <div className="grid grid-cols-2 gap-6">
              {[
                { 
                  icon: <FiRefreshCw className="text-3xl" />, 
                  title: "Swap", 
                  description: "Trade tokens" 
                },
                { 
                  icon: <FiImage className="text-3xl" />, 
                  title: "NFTs", 
                  description: "Meme collectibles" 
                },
                { 
                  icon: <FiLock className="text-3xl" />, 
                  title: "Staking", 
                  description: "Earn rewards" 
                },
                { 
                  icon: <FiUsers className="text-3xl" />, 
                  title: "DAO", 
                  description: "Community governance" 
                },
                { 
                  icon: <FiGift className="text-3xl" />, 
                  title: "Airdrops", 
                  description: "Free token distributions" 
                },
                { 
                  icon: <FiPieChart className="text-3xl" />, 
                  title: "Analytics", 
                  description: "Trading insights" 
                },
              ].map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  viewport={{ once: true }}
                  className="bg-gray-700/50 hover:bg-gray-700 border border-gray-600 rounded-xl p-6 text-center transition-all"
                >
                  <div className="text-yellow-500 mb-3">
                    {item.icon}
                  </div>
                  <h3 className="text-lg font-bold">{item.title}</h3>
                  <p className="text-gray-400 text-sm">{item.description}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7 }}
            viewport={{ once: true }}
            className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-2xl p-8"
          >
            <div className="flex items-start mb-6">
              <div className="bg-yellow-500/20 p-3 rounded-xl mr-4">
                <FiZap className="text-yellow-500 text-2xl" />
              </div>
              <div>
                <h3 className="text-2xl font-bold mb-2">Complete Ecosystem</h3>
                <p className="text-gray-300">
                  Everything you need in one platform
                </p>
              </div>
            </div>
            
            <div className="space-y-4">
              {[
                "NFT marketplace for meme collectibles",
                "Staking with competitive APY",
                "Community governance through DAO",
                "Airdrop & referral programs",
                "Advanced trading analytics"
              ].map((item, index) => (
                <div key={index} className="flex items-start">
                  <div className="bg-gray-700 w-6 h-6 rounded-full flex items-center justify-center mt-1 mr-3 flex-shrink-0">
                    <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                  </div>
                  <span className="text-gray-300">{item}</span>
                </div>
              ))}
            </div>
            
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              className="mt-8 w-full bg-gradient-to-r from-yellow-500 to-yellow-600 text-black font-bold py-3 px-6 rounded-xl"
            // className="mt-8 w-full"
          >
            <a
              href="/ecosystem"
              className="block w-full bg-gradient-to-r from-yellow-500 to-yellow-600 text-black font-bold py-3 px-6 rounded-xl text-center"
            >
              Explore Ecosystem
            </a>
          </motion.button>
          </motion.div>
        </div>
      </div>
    </section>
  );
}