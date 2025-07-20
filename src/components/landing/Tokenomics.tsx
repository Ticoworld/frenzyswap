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