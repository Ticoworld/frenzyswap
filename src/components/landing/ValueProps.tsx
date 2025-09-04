'use client';

import { FiDollarSign, FiShoppingCart, FiZap, FiTrendingUp } from 'react-icons/fi';
import { motion } from 'framer-motion';
export default function ValueProps() {
  return (
    <section className="min-h-screen py-16 bg-gray-100 dark:bg-gray-800 flex items-center relative overflow-hidden">
      {/* Value-Focused Cosmic Background */}
      <div className="absolute inset-0 z-0">
        {/* Financial/value cosmic grid */}
        <motion.div
          className="absolute inset-0 opacity-20"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.2 }}
          transition={{ duration: 2 }}
        >
          <svg className="w-full h-full" viewBox="0 0 1440 800">
            <defs>
              <pattern id="value-grid" x="0" y="0" width="120" height="120" patternUnits="userSpaceOnUse">
                <path d="M 120 0 L 0 0 0 120" fill="none" stroke="#10b981" strokeWidth="1" opacity="0.4"/>
                <circle cx="0" cy="0" r="2" fill="#10b981" opacity="0.6"/>
                <circle cx="60" cy="60" r="1.5" fill="#facc15" opacity="0.5"/>
              </pattern>
              <radialGradient id="value-glow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#10b981" stopOpacity="0.15"/>
                <stop offset="100%" stopColor="#10b981" stopOpacity="0"/>
              </radialGradient>
            </defs>
            <rect width="100%" height="100%" fill="url(#value-grid)"/>
            <circle cx="25%" cy="25%" r="200" fill="url(#value-glow)"/>
            <circle cx="75%" cy="75%" r="160" fill="url(#value-glow)"/>
            {/* Value flow lines */}
            <path d="M 100 300 Q 300 250 500 350 T 800 400" stroke="#10b981" strokeWidth="1.5" opacity="0.3" fill="none"/>
            <path d="M 200 150 Q 400 100 600 200 T 900 250" stroke="#facc15" strokeWidth="1" opacity="0.3" fill="none"/>
          </svg>
        </motion.div>

        {/* Value-themed floating particles */}
        <div className="absolute inset-0">
          {Array.from({ length: 15 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                width: `${2 + Math.random() * 2}px`,
                height: `${2 + Math.random() * 2}px`,
                background: i % 3 === 0 ? '#10b981' : i % 3 === 1 ? '#facc15' : '#3b82f6',
                opacity: 0.4,
              }}
              animate={{
                y: [0, -15, 0],
                opacity: [0.2, 0.6, 0.2],
              }}
              transition={{
                duration: 4 + Math.random() * 3,
                repeat: Infinity,
                delay: Math.random() * 3,
              }}
            />
          ))}
        </div>

        {/* Subtle gradient circles */}
        <motion.div
          className="absolute top-20 right-20 w-72 h-72 bg-green-500/8 rounded-full blur-3xl"
          animate={{ scale: [1, 1.2, 1], opacity: [0.05, 0.15, 0.05] }}
          transition={{ duration: 14, repeat: Infinity, repeatType: "reverse" }}
        />
        <motion.div
          className="absolute bottom-20 left-20 w-80 h-80 bg-yellow-500/6 rounded-full blur-3xl"
          animate={{ scale: [1, 1.1, 1], opacity: [0.03, 0.12, 0.03] }}
          transition={{ duration: 16, repeat: Infinity, repeatType: "reverse" }}
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
            How <span className="text-yellow-500">FrenzySwap</span> Powers $MEME
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Tokenomics designed to reward holders and create sustainable growth
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              icon: <FiDollarSign className="text-4xl" />,
              title: "Swap Fees",
              description: "Small fee on every transaction",
              color: "from-yellow-500 to-yellow-400"
            },
            {
              icon: <FiShoppingCart className="text-4xl" />,
              title: "Token Buyback",
              description: "Fees used to buy $MEME",
              color: "from-purple-500 to-purple-400"
            },
            {
              icon: <FiZap className="text-4xl" />,
              title: "Token Burn",
              description: "Purchased tokens destroyed",
              color: "from-red-500 to-red-400"
            },
            {
              icon: <FiTrendingUp className="text-4xl" />,
              title: "Value Growth",
              description: "Reduced supply increases value",
              color: "from-green-500 to-green-400"
            }
          ].map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="bg-gradient-to-br from-white to-gray-50 dark:via-gray-800 dark:to-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 text-center shadow-lg"
            >
              <div className={`bg-gradient-to-r ${item.color} w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6`}>
                {item.icon}
              </div>
              <h3 className="text-xl font-bold mb-2">{item.title}</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">{item.description}</p>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          viewport={{ once: true }}
          className="mt-16 bg-gradient-to-r from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl border border-yellow-500/30 p-8 shadow-lg"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
            <div className="md:col-span-2">
              <div className="flex items-center mb-4">
                <div className="bg-yellow-500/20 p-2 rounded-lg mr-4">
                  <FiZap className="text-yellow-500 text-2xl" />
                </div>
                <h3 className="text-2xl font-bold">Deflationary Engine</h3>
              </div>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Every swap fuels the $MEME ecosystem, creating a self-sustaining value loop
              </p>
              <div className="flex items-center text-yellow-500">
                <div className="w-3 h-3 rounded-full bg-yellow-500 mr-2 animate-pulse"></div>
                <span>Increasing token value with each transaction</span>
              </div>
            </div>
            <div className="bg-gray-100/50 dark:bg-gray-700/50 rounded-xl p-6">
              <div className="flex justify-between items-center mb-4">
                <div className="text-sm text-gray-500 dark:text-gray-400">Total Burned</div>
                <div className="text-yellow-500 font-bold">5.2M $MEME</div>
              </div>
              <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded-full overflow-hidden">
                <motion.div 
                  className="h-full bg-gradient-to-r from-yellow-500 to-yellow-400 rounded-full"
                  initial={{ width: 0 }}
                  whileInView={{ width: "65%" }}
                  transition={{ duration: 1, delay: 0.5 }}
                  viewport={{ once: true }}
                ></motion.div>
              </div>
              <div className="text-right mt-2 text-gray-500 dark:text-gray-400 text-sm">
                Target: 8M $MEME
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}