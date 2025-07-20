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
    <section className="min-h-screen py-16 bg-gray-800 flex items-center overflow-x-hidden">
      <div className="container mx-auto px-4">
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