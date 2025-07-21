'use client';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { 
  FiPieChart, 
  FiTrendingUp,
  FiAward,
  FiGlobe,
  FiZap,
  FiRefreshCw 
} from 'react-icons/fi';
import AnimatedCounter from '@/components/ui/AnimatedCounter';

export default function Tokenomics() {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const tokenDistribution = [
    { label: "Community Rewards", percentage: 45, color: "bg-yellow-500" },
    { label: "Liquidity", percentage: 25, color: "bg-blue-500" },
    { label: "Ecosystem Fund", percentage: 15, color: "bg-green-500" },
    { label: "Team", percentage: 10, color: "bg-purple-500" },
    { label: "Advisors", percentage: 5, color: "bg-red-500" },
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

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <section className="py-16 bg-gray-900 relative overflow-hidden">
      {/* Cosmic Tokenomics Background */}
      <div className="absolute inset-0 z-0">
        {/* Enhanced cosmic grid with purple/green theme for tokenomics */}
        <motion.div
          className="absolute inset-0 opacity-30"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.3 }}
          transition={{ duration: 2 }}
        >
          <svg className="w-full h-full" viewBox="0 0 1440 800">
            <defs>
              <pattern id="tokenomics-grid" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
                <path d="M 100 0 L 0 0 0 100" fill="none" stroke="#8b5cf6" strokeWidth="1" opacity="0.5"/>
                <circle cx="0" cy="0" r="2" fill="#8b5cf6" opacity="0.7"/>
                <circle cx="50" cy="50" r="1" fill="#10b981" opacity="0.6"/>
              </pattern>
              <radialGradient id="tokenomics-glow-purple" cx="50%" cy="50%" r="60%">
                <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.2"/>
                <stop offset="50%" stopColor="#10b981" stopOpacity="0.1"/>
                <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0"/>
              </radialGradient>
              <radialGradient id="tokenomics-glow-green" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#10b981" stopOpacity="0.15"/>
                <stop offset="100%" stopColor="#10b981" stopOpacity="0"/>
              </radialGradient>
              <filter id="tokenomics-glow">
                <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                <feMerge> 
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>
            <rect width="100%" height="100%" fill="url(#tokenomics-grid)"/>
            <circle cx="30%" cy="20%" r="220" fill="url(#tokenomics-glow-purple)" filter="url(#tokenomics-glow)"/>
            <circle cx="70%" cy="80%" r="180" fill="url(#tokenomics-glow-green)" filter="url(#tokenomics-glow)"/>
            {/* Tokenomics connection lines representing value flow */}
            <path d="M 150 200 Q 300 150 450 250 T 750 300" stroke="#8b5cf6" strokeWidth="2" opacity="0.4" fill="none" filter="url(#tokenomics-glow)"/>
            <path d="M 200 400 Q 400 350 600 450 T 1000 500" stroke="#10b981" strokeWidth="1.5" opacity="0.4" fill="none"/>
            <path d="M 100 100 Q 250 80 400 150 T 700 200" stroke="#facc15" strokeWidth="1" opacity="0.3" fill="none"/>
          </svg>
        </motion.div>

        {/* Token-themed floating particles */}
        <div className="absolute inset-0">
          {Array.from({ length: 25 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                width: `${2 + Math.random() * 3}px`,
                height: `${2 + Math.random() * 3}px`,
                background: i % 4 === 0 ? '#8b5cf6' : i % 4 === 1 ? '#10b981' : i % 4 === 2 ? '#facc15' : '#3b82f6',
                opacity: 0.5,
                boxShadow: '0 0 4px currentColor',
              }}
              animate={{
                y: [0, -20, 0],
                x: [0, Math.random() * 15 - 7.5, 0],
                opacity: [0.3, 0.7, 0.3],
                scale: [1, 1.3, 1],
              }}
              transition={{
                duration: 6 + Math.random() * 4,
                repeat: Infinity,
                delay: Math.random() * 5,
                ease: "easeInOut",
              }}
            />
          ))}
        </div>

        {/* Enhanced animated gradient circles for tokenomics */}
        <motion.div
          className="absolute top-16 left-16 w-96 h-96 bg-purple-500/15 rounded-full blur-3xl"
          animate={{ scale: [1, 1.4, 1], opacity: [0.1, 0.25, 0.1] }}
          transition={{ duration: 15, repeat: Infinity, repeatType: "reverse" }}
        />
        <motion.div
          className="absolute bottom-16 right-16 w-80 h-80 bg-green-500/12 rounded-full blur-3xl"
          animate={{ scale: [1, 1.3, 1], opacity: [0.08, 0.2, 0.08] }}
          transition={{ duration: 18, repeat: Infinity, repeatType: "reverse" }}
        />
        <motion.div
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-yellow-500/8 rounded-full blur-3xl"
          animate={{ scale: [1, 1.2, 1], opacity: [0.05, 0.15, 0.05] }}
          transition={{ duration: 20, repeat: Infinity, repeatType: "reverse" }}
        />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12 md:mb-16"
          ref={ref}
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            <span className="text-yellow-500">$MEME</span> Tokenomics
          </h2>
          <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto">
            Sustainable token economics designed for long-term growth and value creation
          </p>
        </motion.div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Column */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={inView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
            transition={{ duration: 0.8 }}
            className="w-full lg:w-1/2"
          >
            <div className="bg-gray-800 rounded-xl p-6 md:p-8 border border-gray-700 h-full">
              <div className="flex items-center mb-6">
                <FiPieChart className="text-yellow-500 mr-3 text-2xl" />
                <h3 className="text-xl md:text-2xl font-bold">Token Distribution</h3>
              </div>
              
              <motion.div 
                className="mb-6 md:mb-8"
                variants={container}
                initial="hidden"
                animate={inView ? "show" : "hidden"}
              >
                {tokenDistribution.map((item, index) => (
                  <motion.div 
                    key={index} 
                    className="mb-4"
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <div className="flex justify-between mb-1 text-sm md:text-base">
                      <span>{item.label}</span>
                      <span>{item.percentage}%</span>
                    </div>
                    <div className="h-2.5 md:h-3 bg-gray-700 rounded-full overflow-hidden">
                      <motion.div 
                        className={`h-full ${item.color} rounded-full`}
                        initial={{ width: 0 }}
                        animate={{ width: `${item.percentage}%` }}
                        transition={{ duration: 1, delay: 0.2 * index }}
                      ></motion.div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                <div className="bg-gray-700 rounded-lg p-3 md:p-4">
                  <div className="text-2xl md:text-3xl font-bold text-yellow-500">
                    <AnimatedCounter value={1000000000} suffix="+" />
                  </div>
                  <div className="text-gray-400 text-sm md:text-base">Total Supply</div>
                </div>
                <div className="bg-gray-700 rounded-lg p-3 md:p-4">
                  <div className="text-2xl md:text-3xl font-bold text-yellow-500">2.5%</div>
                  <div className="text-gray-400 text-sm md:text-base">Transaction Fee</div>
                </div>
                <div className="bg-gray-700 rounded-lg p-3 md:p-4">
                  <div className="text-2xl md:text-3xl font-bold text-yellow-500">1.5%</div>
                  <div className="text-gray-400 text-sm md:text-base">Buyback & Burn</div>
                </div>
                <div className="bg-gray-700 rounded-lg p-3 md:p-4">
                  <div className="text-2xl md:text-3xl font-bold text-yellow-500">1%</div>
                  <div className="text-gray-400 text-sm md:text-base">Rewards Pool</div>
                </div>
              </div>
            </div>
          </motion.div>
          
          {/* Right Column */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={inView ? { opacity: 1, x: 0 } : { opacity: 0, x: 20 }}
            transition={{ duration: 0.8 }}
            className="w-full lg:w-1/2"
          >
            <div className="bg-gray-800 rounded-xl p-6 md:p-8 border border-gray-700 h-full">
              <div className="flex items-center mb-6">
                <FiTrendingUp className="text-yellow-500 mr-3 text-2xl" />
                <h3 className="text-xl md:text-2xl font-bold">Value Creation</h3>
              </div>
              
              <div className="space-y-4 md:space-y-6">
                {[
                  {
                    icon: <FiZap className="text-xl md:text-2xl" />,
                    title: "Deflationary Mechanism",
                    description: "Continuous token burning reduces supply, increasing scarcity and value"
                  },
                  {
                    icon: <FiRefreshCw className="text-xl md:text-2xl" />,
                    title: "Fee Redistribution",
                    description: "A portion of fees is redistributed to stakers and liquidity providers"
                  },
                  {
                    icon: <FiGlobe className="text-xl md:text-2xl" />,
                    title: "Ecosystem Growth",
                    description: "Funds allocated to develop new features and expand the platform"
                  },
                  {
                    icon: <FiAward className="text-xl md:text-2xl" />,
                    title: "Community Governance",
                    description: "$MEME holders vote on key decisions and protocol upgrades"
                  }
                ].map((item, index) => (
                  <motion.div 
                    key={index}
                    className="flex items-start"
                    initial={{ opacity: 0, y: 20 }}
                    animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                    transition={{ delay: 0.1 * index }}
                  >
                    <div className="text-yellow-500 mr-3 md:mr-4 mt-1">{item.icon}</div>
                    <div>
                      <h4 className="text-base md:text-lg font-bold mb-1">{item.title}</h4>
                      <p className="text-gray-300 text-sm md:text-base">{item.description}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}