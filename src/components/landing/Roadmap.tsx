'use client';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { 
  FiCheckCircle, 
  FiClock, 
  FiTrendingUp,
  FiZap
} from 'react-icons/fi';

export default function Roadmap() {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const phases = [
    {
      title: "Phase 1: Launch & Foundation",
      date: "Q4 2023",
      status: "completed",
      items: [
        "FrenzySwap DEX Aggregator Launch",
        "$MEME Token Deployment",
        "Buyback & Burn Mechanism",
        "Initial Liquidity Pools"
      ]
    },
    {
      title: "Phase 2: Ecosystem Expansion",
      date: "Q1 2024",
      status: "current",
      items: [
        "NFT Marketplace Beta",
        "Staking Platform Launch",
        "DAO Governance Framework",
        "Mobile App Development"
      ]
    },
    {
      title: "Phase 3: Growth & Innovation",
      date: "Q2 2024",
      status: "upcoming",
      items: [
        "Cross-chain Integration",
        "Advanced Trading Features",
        "Frenzy Analytics Dashboard",
        "Referral & Affiliate Program"
      ]
    }
  ];

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <section className="py-16 bg-gray-900">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
          ref={ref}
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Our <span className="text-yellow-500">Roadmap</span>
          </h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Strategic development plan to build the ultimate meme token ecosystem
          </p>
        </motion.div>

        <div className="relative">
          {/* Timeline */}
          <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-0.5 bg-gray-700 transform md:-translate-x-1/2"></div>
          
          <motion.div
            variants={container}
            initial="hidden"
            animate={inView ? "show" : "hidden"}
            className="space-y-12"
          >
            {phases.map((phase, index) => {
              const isEven = index % 2 === 0;
              return (
                <motion.div 
                  key={index}
                  variants={item}
                  className="relative"
                >
                  {/* Timeline point */}
                  <div className="absolute left-0 md:left-1/2 w-8 h-8 rounded-full bg-gray-800 border-4 border-yellow-500 transform md:-translate-x-1/2 -translate-y-4 flex items-center justify-center">
                    {phase.status === "completed" ? (
                      <FiCheckCircle className="text-green-500" />
                    ) : phase.status === "current" ? (
                      <FiZap className="text-yellow-500 animate-pulse" />
                    ) : (
                      <FiClock className="text-gray-400" />
                    )}
                  </div>
                  
                  <div className={`ml-12 md:ml-0 ${isEven ? 'md:pr-12 md:text-right' : 'md:pl-12'}`}>
                    <div className={`bg-gray-800 rounded-xl p-6 border ${
                      phase.status === "completed" 
                        ? "border-green-500" 
                        : phase.status === "current" 
                          ? "border-yellow-500 shadow-lg shadow-yellow-500/20" 
                          : "border-gray-700"
                    }`}>
                      <div className={`flex ${isEven ? 'md:justify-end' : ''} items-center mb-4`}>
                        <span className={`inline-block px-3 py-1 rounded-full text-sm font-bold ${
                          phase.status === "completed" 
                            ? "bg-green-500/20 text-green-400" 
                            : phase.status === "current" 
                              ? "bg-yellow-500/20 text-yellow-400" 
                              : "bg-gray-700 text-gray-400"
                        }`}>
                          {phase.date}
                        </span>
                      </div>
                      
                      <h3 className={`text-xl font-bold mb-4 ${isEven ? 'md:text-right' : ''}`}>
                        {phase.title}
                      </h3>
                      
                      <ul className={`space-y-3 ${isEven ? 'md:ml-auto md:text-right' : ''}`}>
                        {phase.items.map((item, itemIndex) => (
                          <li key={itemIndex} className="flex items-start">
                            {!isEven && (
                              <FiTrendingUp className="text-yellow-500 mr-2 mt-1 flex-shrink-0" />
                            )}
                            <span className="text-gray-300">{item}</span>
                            {isEven && (
                              <FiTrendingUp className="text-yellow-500 ml-2 mt-1 flex-shrink-0" />
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </div>
    </section>
  );
}