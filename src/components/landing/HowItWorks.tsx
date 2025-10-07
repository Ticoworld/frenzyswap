'use client';
import { motion } from 'framer-motion';
import { 
  FiRefreshCw, 
  FiDollarSign, 
  FiShoppingCart,
  FiZap,
  FiArrowRight,
  FiTrendingUp
} from 'react-icons/fi';
import Image from 'next/image';
import Link from 'next/link';

export default function HowItWorks() {
  return (
    <section className="py-16 bg-black relative overflow-hidden">

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16 max-w-3xl mx-auto"
        >
          <h2 className="text-display-sm md:text-display-md font-bold mb-4">
            How <span className="text-brand-purple">FrenzySwap</span> Works
          </h2>
          <p className="text-body-lg text-gray-400">
            Simple, transparent, and designed to create sustainable value
          </p>
        </motion.div>

        <div className="flex flex-col lg:flex-row gap-12 lg:gap-16 items-center">
          {/* Left Column - Process Steps */}
          <div className="lg:w-1/2">
            <div className="max-w-lg mx-auto lg:mx-0 space-y-8">
              {[
                {
                  icon: <FiRefreshCw className="text-2xl" />,
                  title: "Swap Tokens",
                  description: "Execute trades with optimal routing and best prices via Jupiter Protocol"
                },
                {
                  icon: <FiDollarSign className="text-2xl" />,
                  title: "Protocol Fees",
                  description: "Competitive platform fees collected on each transaction"
                },
                {
                  icon: <FiShoppingCart className="text-2xl" />,
                  title: "Buyback Mechanism",
                  description: "Automated token buyback from the open market using collected fees"
                },
                {
                  icon: <FiZap className="text-2xl" />,
                  title: "Burn Process",
                  description: "Purchased tokens permanently removed from circulation, reducing total supply"
                }
              ].map((step, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.15 }}
                  viewport={{ once: true }}
                  className="flex items-start gap-4 group"
                >
                  <div className="bg-brand-purple/10 border-2 border-brand-purple/20 w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:border-brand-purple/40 transition-colors">
                    <div className="text-brand-purple">{step.icon}</div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-heading-lg font-bold text-white mb-2">{step.title}</h3>
                    <p className="text-body-sm text-gray-400 leading-relaxed">{step.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
          
          {/* Right Column - Visualization - NO CONTAINER */}
          <div className="lg:w-1/2 flex justify-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7 }}
              viewport={{ once: true }}
              className="w-full max-w-lg"
            >
              {/* Image without container - Blended edges */}
              <div className="relative mx-auto w-full aspect-square mb-6 overflow-hidden">
                <div className="relative">
                  <Image
                    src="/assets/landing/how-it-works-isometric.png"
                    alt="Value Cycle"
                    width={1200}
                    height={1200}
                    className="w-full h-auto"
                    style={{
                      maskImage: 'radial-gradient(ellipse at center, black 50%, transparent 80%)',
                      WebkitMaskImage: 'radial-gradient(ellipse at center, black 50%, transparent 80%)',
                    }}
                  />
                  {/* Subtle gradient overlay for better blending */}
                  <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-transparent to-black/30"></div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/20"></div>
                </div>
              </div>
              
              {/* Flow description */}
              <div className="text-center">
                <div className="flex items-center justify-center flex-wrap gap-2 mb-4">
                  <span className="bg-brand-purple/20 text-brand-purple px-3 py-1 rounded-2xl text-sm font-medium border border-brand-purple/20">Swap</span>
                  <FiArrowRight className="text-brand-purple" />
                  <span className="bg-brand-purple/20 text-brand-purple px-3 py-1 rounded-2xl text-sm font-medium border border-brand-purple/20">Fee</span>
                  <FiArrowRight className="text-brand-purple" />
                  <span className="bg-brand-purple/20 text-brand-purple px-3 py-1 rounded-2xl text-sm font-medium border border-brand-purple/20">Burn</span>
                  <FiArrowRight className="text-brand-purple" />
                  <span className="bg-brand-purple/20 text-brand-purple px-3 py-1 rounded-2xl text-sm font-medium border border-brand-purple/20">Value ↑</span>
                </div>
                <p className="text-body-sm text-gray-400 leading-relaxed mb-4">
                  Each transaction reduces token supply, creating deflationary pressure
                </p>
                
                <Link href="/swap">
                  <button className="w-full bg-brand-purple hover:bg-brand-purple/90 text-white px-6 py-3 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2">
                    <span>Start Trading</span>
                    <FiArrowRight />
                  </button>
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}