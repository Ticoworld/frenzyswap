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

export default function HowItWorks() {
  return (
    <section className="min-h-screen py-16 bg-gray-900 flex items-center overflow-x-hidden">
      <div className="container mx-auto px-4">
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
          <p className="text-lg text-gray-300">
            Swap. Fee. Buyback. Burn. Value up.
          </p>
        </motion.div>

        <div className="flex flex-col lg:flex-row gap-12">
          {/* Left Column - Process Steps */}
          <div className="lg:w-1/2">
            <div className="relative">
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
                      <div className="bg-gray-800 rounded-full w-8 h-8 flex items-center justify-center mr-3 border border-yellow-500/30">
                        <span className="text-sm font-bold text-yellow-500">{index + 1}</span>
                      </div>
                      <h3 className="text-xl font-bold border-b-2 border-yellow-500 pb-1">{step.title}</h3>
                    </div>
                    <p className="text-gray-300">{step.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
          
          {/* Right Column - Visualization */}
          <div className="lg:w-1/2">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7 }}
              viewport={{ once: true }}
              className="h-full flex flex-col"
            >
              <div className="bg-gradient-to-br from-gray-800 to-gray-900 border-2 border-yellow-500/20 rounded-2xl p-8 h-full flex flex-col">
                <div className="flex-1 flex flex-col justify-center">
                  {/* Value Cycle Visualization */}
                  <div className="relative mx-auto w-full max-w-md aspect-square mb-10">
                    {/* Circular background */}
                    <div className="absolute inset-0 rounded-full border-4 border-yellow-500/10"></div>
                    
                    {/* Animated nodes */}
                    {[0, 1, 2, 3].map((i) => (
                      <motion.div
                        key={i}
                        className="absolute w-16 h-16 rounded-full bg-gradient-to-br from-gray-800 to-gray-900 border-2 border-yellow-500/30 flex items-center justify-center shadow-lg"
                        style={{
                          top: `${42 - 48 * Math.sin((i * Math.PI)/2)}%`,
                          left: `${42 + 48 * Math.cos((i * Math.PI)/2)}%`,
                        }}
                        animate={{ 
                          scale: [1, 1.1, 1],
                          boxShadow: ["0 0 0 0 rgba(250, 204, 21, 0)", "0 0 0 10px rgba(250, 204, 21, 0.1)", "0 0 0 0 rgba(250, 204, 21, 0)"]
                        }}
                        transition={{
                          duration: 3,
                          repeat: Infinity,
                          delay: i * 0.5,
                          ease: "easeInOut"
                        }}
                      >
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-500 to-yellow-600 flex items-center justify-center text-black">
                          {i === 0 && <FiRefreshCw />}
                          {i === 1 && <FiDollarSign />}
                          {i === 2 && <FiShoppingCart />}
                          {i === 3 && <FiZap />}
                        </div>
                      </motion.div>
                    ))}
                    
                    {/* Moving indicator */}
                    <motion.div
                      className="absolute top-1/2 left-1/2 w-4 h-4 bg-yellow-500 rounded-full shadow-lg"
                      animate={{
                        top: [
                          "0%", 
                          "0%", 
                          "100%", 
                          "100%", 
                          "0%"
                        ],
                        left: [
                          "0%", 
                          "100%", 
                          "100%", 
                          "0%", 
                          "0%"
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
                      <div className="text-yellow-500 text-2xl font-bold mb-1">$MEME</div>
                      <div className="text-gray-300 text-sm">Value Growth</div>
                    </div>
                  </div>
                  
                  {/* Description */}
                  <div className="text-center mt-8">
                    <h3 className="text-xl font-bold mb-6 flex items-center justify-center">
                      <span className="bg-yellow-500 text-black px-4 py-2 rounded-lg mr-2">Swap</span>
                      <FiArrowRight className="text-yellow-500 mx-2 text-xl" />
                      <span className="bg-yellow-500 text-black px-4 py-2 rounded-lg mr-2">Burn</span>
                      <FiArrowRight className="text-yellow-500 mx-2 text-xl" />
                      <span className="bg-green-500 text-white px-4 py-2 rounded-lg">Value ↑</span>
                    </h3>
                    <p className="text-gray-300 max-w-xl mx-auto px-4 border-t border-b border-yellow-500/20 py-4">
                      Each transaction reduces $MEME supply, increasing token value for all holders
                    </p>
                    <div className="mt-4 flex items-center justify-center text-xs text-gray-400">
                      <span className="mr-1">Powered by</span>
                      <img src="/jupiter-ag-jup-logo.svg" alt="Jupiter Logo" className="h-4 w-4 inline-block mr-1 align-text-bottom" />
                      <span className="font-semibold text-yellow-500">Jupiter</span>
                    </div>
                  </div>
                </div>
                
                <div className="mt-8 pt-8 border-t border-yellow-500/20">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
                        className={`p-3 rounded-lg text-center border ${stat.color}`}
                      >
                        <div className="text-yellow-500 text-xl font-bold">{stat.value}</div>
                        <div className="text-gray-400 text-sm mt-1">{stat.label}</div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
              
              <motion.div
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                className="mt-8 bg-gradient-to-r from-yellow-500 to-yellow-600 text-black font-bold py-4 px-8 rounded-xl text-center border-2 border-yellow-400 shadow-lg"
              >
                Start Swapping Now
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}