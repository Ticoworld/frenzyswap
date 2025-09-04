'use client';
import { motion } from 'framer-motion';
import { 
  FiRefreshCw, 
  FiDollarSign, 
  FiShoppingCart,
  FiZap,
  FiArrowRight
} from 'react-icons/fi';
import Image from 'next/image';
import Link from 'next/link';

export default function HowItWorks() {
  return (
    <section className="min-h-screen py-16 bg-gray-50 dark:bg-gray-900 flex md:items-center  items-start -x-hidden relative">
      {/* Web3 Background Pattern */}
      <div className="absolute inset-0 z-0">
        {/* Cosmic grid background */}
        <motion.div
          className="absolute inset-0 opacity-25"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.25 }}
          transition={{ duration: 2 }}
        >
          <svg className="w-full h-full" viewBox="0 0 1440 800">
            <defs>
              <pattern id="how-it-works-grid" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
                <path d="M 80 0 L 0 0 0 80" fill="none" stroke="#facc15" strokeWidth="0.8" opacity="0.4"/>
                <circle cx="0" cy="0" r="1.5" fill="#facc15" opacity="0.6"/>
              </pattern>
              <radialGradient id="how-it-works-glow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.15"/>
                <stop offset="100%" stopColor="#3b82f6" stopOpacity="0"/>
              </radialGradient>
            </defs>
            <rect width="100%" height="100%" fill="url(#how-it-works-grid)"/>
            <circle cx="20%" cy="30%" r="180" fill="url(#how-it-works-glow)"/>
            <circle cx="80%" cy="70%" r="160" fill="url(#how-it-works-glow)"/>
          </svg>
        </motion.div>

        {/* Floating particles */}
        <div className="absolute inset-0">
          {Array.from({ length: 20 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                width: `${1.5 + Math.random() * 2}px`,
                height: `${1.5 + Math.random() * 2}px`,
                background: i % 2 === 0 ? '#3b82f6' : '#facc15',
                opacity: 0.4,
              }}
              animate={{
                y: [0, -25, 0],
                opacity: [0.2, 0.6, 0.2],
              }}
              transition={{
                duration: 5 + Math.random() * 3,
                repeat: Infinity,
                delay: Math.random() * 4,
              }}
            />
          ))}
        </div>

        {/* Subtle gradient circles */}
        <motion.div
          className="absolute top-10 right-10 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl"
          animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.2, 0.1] }}
          transition={{ duration: 12, repeat: Infinity, repeatType: "reverse" }}
        />
        <motion.div
          className="absolute bottom-10 left-10 w-80 h-80 bg-yellow-500/8 rounded-full blur-3xl"
          animate={{ scale: [1, 1.1, 1], opacity: [0.05, 0.15, 0.05] }}
          transition={{ duration: 10, repeat: Infinity, repeatType: "reverse" }}
        />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16 max-w-3xl mx-auto"
        >
          <div className="inline-flex items-center justify-center bg-yellow-500/10 text-yellow-500 px-6 py-2 rounded-full mb-6 border border-yellow-500/30">
            <FiZap className="mr-2" />
            <span className="font-bold">Value Cycle Engine</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            The <span className="text-yellow-500">FrenzySwap</span> Cycle
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Swap. Fee. Buyback. Burn. Value up.
          </p>
        </motion.div>

        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-start lg:items-center">
          {/* Left Column - Process Steps */}
          <div className="lg:w-1/2">
            <div className="relative max-w-md mx-auto lg:mx-0">
              {/* Vertical connection line */}
              <div className="absolute left-6 top-0 h-full w-0.5 bg-gradient-to-b from-yellow-500 to-transparent -z-10"></div>
              
              {[
                {
                  icon: <FiRefreshCw className="text-2xl" />,
                  title: "Swap",
                  description: "Trade instantly",
                  color: "from-blue-500 to-blue-600",
                  border: "border-blue-500/50"
                },
                {
                  icon: <FiDollarSign className="text-2xl" />,
                  title: "Fee",
                  description: "0.3% per swap",
                  color: "from-purple-500 to-purple-600",
                  border: "border-purple-500/50"
                },
                {
                  icon: <FiShoppingCart className="text-2xl" />,
                  title: "Buyback",
                  description: "$MEME auto-buy",
                  color: "from-green-500 to-green-600",
                  border: "border-green-500/50"
                },
                {
                  icon: <FiZap className="text-2xl" />,
                  title: "Burn",
                  description: "$MEME supply drops",
                  color: "from-red-500 to-red-600",
                  border: "border-red-500/50"
                }
              ].map((step, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.15 }}
                  viewport={{ once: true }}
                  className="flex items-start mb-10 last:mb-0 group"
                >
                  <div className={`bg-gradient-to-r ${step.color} w-14 h-14 rounded-xl flex items-center justify-center mr-6 flex-shrink-0 border-2 ${step.border} group-hover:scale-110 transition-transform`}>
                    {step.icon}
                  </div>
                  <div className="pt-1 border-l-2 border-yellow-500/20 pl-4 py-2">
                    <div className="flex items-center mb-2">
                      <div className="bg-gray-100 dark:bg-gray-800 rounded-full w-8 h-8 flex items-center justify-center mr-3 border border-yellow-500/30">
                        <span className="text-sm font-bold text-yellow-500">{index + 1}</span>
                      </div>
                      <h3 className="text-xl font-bold border-b-2 border-yellow-500 pb-1">{step.title}</h3>
                    </div>
                    <p className="text-gray-600 dark:text-gray-300">{step.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
          
          {/* Right Column - Visualization */}
<div className="lg:w-1/2 flex justify-center lg:justify-start self-center lg:self-start">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7 }}
              viewport={{ once: true }}
              className="w-full max-w-lg flex flex-col"
            >
              <div className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 border-2 border-yellow-500/20 rounded-2xl p-6 flex flex-col shadow-lg">
                <div className="flex-1 flex flex-col justify-center">
                  {/* Value Cycle Visualization */}
                  <div className="relative mx-auto w-full max-w-xs aspect-square mb-6">
                    {/* Circular background */}
                    <div className="absolute inset-0 rounded-full border-2 border-yellow-500/10"></div>
                    
                    {/* Animated nodes */}
                    {[0, 1, 2, 3].map((i) => (
                      <motion.div
                        key={i}
                        className="absolute w-12 h-12 rounded-full bg-gradient-to-br from-white to-gray-100 dark:from-gray-800 dark:to-gray-900 border-2 border-yellow-500/30 flex items-center justify-center shadow-lg"
                        style={{
                          top: `${42 - 40 * Math.sin((i * Math.PI)/2)}%`,
                          left: `${42 + 40 * Math.cos((i * Math.PI)/2)}%`,
                        }}
                        animate={{ 
                          scale: [1, 1.1, 1],
                          boxShadow: ["0 0 0 0 rgba(250, 204, 21, 0)", "0 0 0 8px rgba(250, 204, 21, 0.1)", "0 0 0 0 rgba(250, 204, 21, 0)"]
                        }}
                        transition={{
                          duration: 3,
                          repeat: Infinity,
                          delay: i * 0.5,
                          ease: "easeInOut"
                        }}
                      >
                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-yellow-500 to-yellow-600 flex items-center justify-center text-black text-sm">
                          {i === 0 && <FiRefreshCw />}
                          {i === 1 && <FiDollarSign />}
                          {i === 2 && <FiShoppingCart />}
                          {i === 3 && <FiZap />}
                        </div>
                      </motion.div>
                    ))}
                    
                    {/* Moving indicator */}
                    <motion.div
                      className="absolute top-1/2 left-1/2 w-3 h-3 bg-yellow-500 rounded-full shadow-lg"
                      animate={{
                        top: [
                          "2%", 
                          "2%", 
                          "98%", 
                          "98%", 
                          "2%"
                        ],
                        left: [
                          "2%", 
                          "98%", 
                          "98%", 
                          "2%", 
                          "2%"
                        ]
                      }}
                      transition={{
                        duration: 12,
                        repeat: Infinity,
                        ease: "linear"
                      }}
                    />
                    
                    {/* Center value growth */}
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
                      <div className="text-yellow-500 text-lg font-bold mb-1">$MEME</div>
                      <div className="text-gray-600 dark:text-gray-300 text-xs">Value Growth</div>
                    </div>
                  </div>
                  
                  {/* Description */}
                  <div className="text-center mt-6">
                    <h3 className="text-lg font-bold mb-4 flex items-center justify-center flex-wrap gap-2">
                      <span className="bg-yellow-500 text-black px-3 py-1 rounded-lg text-sm">Swap</span>
                      <FiArrowRight className="text-yellow-500 text-lg" />
                      <span className="bg-yellow-500 text-black px-3 py-1 rounded-lg text-sm">Burn</span>
                      <FiArrowRight className="text-yellow-500 text-lg" />
                      <span className="bg-green-500 text-white px-3 py-1 rounded-lg text-sm">Value ↑</span>
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed border-t border-b border-yellow-500/20 py-3">
                      Each transaction reduces $MEME supply, increasing token value for all holders
                    </p>
                    <div className="mt-3 flex items-center justify-center text-xs text-gray-500 dark:text-gray-400">
                      <span className="mr-1">Powered by</span>
                      <Image src="/jupiter-ag-jup-logo.svg" alt="Jupiter Logo" width={16} height={16} className="inline-block mr-1" />
                      <span className="font-semibold text-yellow-500">Jupiter</span>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 pt-6 border-t border-yellow-500/20">
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { value: "5.2M", label: "$MEME Burned", color: "bg-yellow-500/10 border-yellow-500/30" },
                      { value: "42%", label: "Value Increase", color: "bg-green-500/10 border-green-500/30" },
                      { value: "89K", label: "Transactions", color: "bg-blue-500/10 border-blue-500/30" },
                      { value: "24K", label: "Active Users", color: "bg-purple-500/10 border-purple-500/30" },
                    ].map((stat, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 + i * 0.1 }}
                        viewport={{ once: true }}
                        className={`p-2 rounded-lg text-center border ${stat.color}`}
                      >
                        <div className="text-yellow-500 text-lg font-bold">{stat.value}</div>
                        <div className="text-gray-500 dark:text-gray-400 text-xs mt-1">{stat.label}</div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
              
              <Link href="/swap">
                <motion.div
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                  className="mt-6 bg-gradient-to-r from-yellow-500 to-yellow-600 text-black font-bold py-3 px-6 rounded-xl text-center border-2 border-yellow-400 shadow-lg cursor-pointer"
                >
                  Start Swapping Now
                </motion.div>
              </Link>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}