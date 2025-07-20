'use client';

import { FiDollarSign, FiShoppingCart, FiZap, FiTrendingUp } from 'react-icons/fi';
import { motion } from 'framer-motion';
export default function ValueProps() {
  return (
    <section className="min-h-screen py-16 bg-gray-800 flex items-center">
      <div className="container mx-auto px-4">
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
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
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
              className="bg-gradient-to-br via-gray-800 to-gray-900 rounded-2xl border border-gray-700 p-6 text-center"
            >
              <div className={`bg-gradient-to-r ${item.color} w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6`}>
                {item.icon}
              </div>
              <h3 className="text-xl font-bold mb-2">{item.title}</h3>
              <p className="text-gray-300 text-sm">{item.description}</p>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          viewport={{ once: true }}
          className="mt-16 bg-gradient-to-r from-gray-800 to-gray-900 rounded-2xl border border-yellow-500/30 p-8"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
            <div className="md:col-span-2">
              <div className="flex items-center mb-4">
                <div className="bg-yellow-500/20 p-2 rounded-lg mr-4">
                  <FiZap className="text-yellow-500 text-2xl" />
                </div>
                <h3 className="text-2xl font-bold">Deflationary Engine</h3>
              </div>
              <p className="text-gray-300 mb-6">
                Every swap fuels the $MEME ecosystem, creating a self-sustaining value loop
              </p>
              <div className="flex items-center text-yellow-500">
                <div className="w-3 h-3 rounded-full bg-yellow-500 mr-2 animate-pulse"></div>
                <span>Increasing token value with each transaction</span>
              </div>
            </div>
            <div className="bg-gray-700/50 rounded-xl p-6">
              <div className="flex justify-between items-center mb-4">
                <div className="text-sm text-gray-400">Total Burned</div>
                <div className="text-yellow-500 font-bold">5.2M $MEME</div>
              </div>
              <div className="h-3 bg-gray-600 rounded-full overflow-hidden">
                <motion.div 
                  className="h-full bg-gradient-to-r from-yellow-500 to-yellow-400 rounded-full"
                  initial={{ width: 0 }}
                  whileInView={{ width: "65%" }}
                  transition={{ duration: 1, delay: 0.5 }}
                  viewport={{ once: true }}
                ></motion.div>
              </div>
              <div className="text-right mt-2 text-gray-400 text-sm">
                Target: 8M $MEME
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}