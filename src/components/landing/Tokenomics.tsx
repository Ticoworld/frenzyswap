'use client';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import Image from 'next/image';
import { 
  FiPieChart, 
  FiTrendingUp,
  FiAward,
  FiGlobe,
  FiZap,
  FiRefreshCw,
  FiArrowRight
} from 'react-icons/fi';
import AnimatedCounter from '@/components/ui/AnimatedCounter';

export default function Tokenomics() {
  const ref = useRef(null);
  const inView = useInView(ref, {
    once: true,
    amount: 0.1,
  });

  const tokenDistribution = [
    { label: "Community Rewards", percentage: 45 },
    { label: "Liquidity Pool", percentage: 25 },
    { label: "Ecosystem Fund", percentage: 15 },
    { label: "Team & Development", percentage: 10 },
    { label: "Advisors & Partners", percentage: 5 },
  ];

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  return (
    <section className="py-16 bg-black relative overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
          ref={ref}
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold mb-4">
            Token <span className="text-brand-purple">Economics</span>
          </h2>
          <p className="text-base sm:text-lg lg:text-xl text-gray-400 max-w-2xl mx-auto">
            Deflationary tokenomics powered by $MEME
          </p>
        </motion.div>

        <div className="flex flex-col lg:flex-row gap-8 items-stretch">
          {/* Left Column - Key Metrics */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={inView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
            transition={{ duration: 0.8 }}
            className="w-full lg:w-1/2 flex"
          >
            <div className="bg-black rounded-2xl p-6 sm:p-8 flex flex-col justify-between w-full">
              <div>
                <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-6">$MEME Supply</h3>
                
                <div className="grid grid-cols-1 gap-4 mb-6">
                  <div className="bg-gray-900/50 rounded-2xl p-4 sm:p-6">
                    <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-brand-purple mb-2">
                      <AnimatedCounter value={1000000000} />
                    </div>
                    <div className="text-gray-400 text-sm">Total Supply</div>
                  </div>
                  <div className="bg-gray-900/50 rounded-2xl p-4 sm:p-6">
                    <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-brand-purple mb-2">
                      Next Burn
                    </div>
                    <div className="text-gray-400 text-sm">Jan 15, 2025</div>
                  </div>
                </div>

                {/* Additional Info */}
                <div className="space-y-3">
                  <div className="flex items-start gap-3 bg-gray-900/30 rounded-xl p-3">
                    <FiZap className="text-brand-purple text-xl flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="text-white font-semibold text-sm mb-1">Deflationary Model</div>
                      <div className="text-gray-400 text-xs">Every transaction reduces total supply</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 bg-gray-900/30 rounded-xl p-3">
                    <FiRefreshCw className="text-brand-purple text-xl flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="text-white font-semibold text-sm mb-1">Auto-Burn</div>
                      <div className="text-gray-400 text-xs">Automated quarterly burns from fee pool</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 bg-gray-900/30 rounded-xl p-3">
                    <FiTrendingUp className="text-brand-purple text-xl flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="text-white font-semibold text-sm mb-1">Value Accrual</div>
                      <div className="text-gray-400 text-xs">Increasing scarcity benefits holders</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
          
          {/* Right Column - Burn Mechanism Visual */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={inView ? { opacity: 1, x: 0 } : { opacity: 0, x: 20 }}
            transition={{ duration: 0.8 }}
            className="w-full lg:w-1/2 flex"
          >
            <div className="bg-black rounded-2xl p-6 sm:p-8 flex flex-col justify-between w-full">
              <div>
                <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-6">Burn Mechanism</h3>
                
                {/* Main Visual - Blended edges */}
                <div className="relative mb-6 overflow-hidden">
                  <div className="relative">
                    <Image
                      src="/assets/landing/tokenomics-burn-visual.png"
                      alt="Token Burn Mechanism"
                      width={1600}
                      height={900}
                      className="w-full h-auto"
                      style={{
                        maskImage: 'radial-gradient(ellipse at center, black 40%, transparent 70%)',
                        WebkitMaskImage: 'radial-gradient(ellipse at center, black 40%, transparent 70%)',
                      }}
                    />
                    {/* Gradient overlay for blending */}
                    <div className="absolute inset-0 bg-gradient-to-r from-black via-transparent to-black opacity-60"></div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black opacity-40"></div>
                  </div>
                </div>

                {/* Simple Flow */}
                <div className="bg-gray-900/50 rounded-xl p-3 sm:p-4">
                  <div className="flex items-center justify-between text-xs sm:text-sm flex-wrap gap-2">
                    <span className="text-gray-400">Every Swap</span>
                    <FiArrowRight className="text-brand-purple" />
                    <span className="text-gray-400">Collects Fee</span>
                    <FiArrowRight className="text-brand-purple" />
                    <span className="text-gray-400">Buys $MEME</span>
                    <FiArrowRight className="text-brand-purple" />
                    <span className="text-brand-purple font-bold">Burns Forever</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}