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
    <section className="py-16 bg-gray-800 relative overflow-hidden">
      {/* Future/Timeline Cosmic Background */}
      <div className="absolute inset-0 z-0">
        {/* Timeline cosmic grid */}
        <motion.div
          className="absolute inset-0 opacity-25"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.25 }}
          transition={{ duration: 2 }}
        >
          <svg className="w-full h-full" viewBox="0 0 1440 800">
            <defs>
              <pattern id="roadmap-grid" x="0" y="0" width="110" height="110" patternUnits="userSpaceOnUse">
                <path d="M 110 0 L 0 0 0 110" fill="none" stroke="#f59e0b" strokeWidth="1.2" opacity="0.5"/>
                <circle cx="0" cy="0" r="2.5" fill="#f59e0b" opacity="0.7"/>
                <circle cx="55" cy="55" r="1.5" fill="#3b82f6" opacity="0.6"/>
              </pattern>
              <radialGradient id="roadmap-glow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.18"/>
                <stop offset="100%" stopColor="#f59e0b" stopOpacity="0"/>
              </radialGradient>
              <linearGradient id="timeline-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.7"/>
                <stop offset="50%" stopColor="#3b82f6" stopOpacity="0.5"/>
                <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.4"/>
              </linearGradient>
            </defs>
            <rect width="100%" height="100%" fill="url(#roadmap-grid)"/>
            <circle cx="30%" cy="40%" r="180" fill="url(#roadmap-glow)"/>
            <circle cx="70%" cy="60%" r="160" fill="url(#roadmap-glow)"/>
            {/* Timeline progression line */}
            <path d="M 50 400 L 350 380 L 650 420 L 950 400 L 1250 380" stroke="url(#timeline-gradient)" strokeWidth="4" opacity="0.6" fill="none"/>
            {/* Milestone markers */}
            <circle cx="350" cy="380" r="7" fill="#f59e0b" opacity="0.9"/>
            <circle cx="650" cy="420" r="6" fill="#3b82f6" opacity="0.8"/>
            <circle cx="950" cy="400" r="5" fill="#8b5cf6" opacity="0.7"/>
          </svg>
        </motion.div>

        {/* Timeline floating particles */}
        <div className="absolute inset-0">
          {Array.from({ length: 22 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                width: `${2.5 + Math.random() * 3}px`,
                height: `${2.5 + Math.random() * 3}px`,
                background: i % 3 === 0 ? '#f59e0b' : i % 3 === 1 ? '#3b82f6' : '#8b5cf6',
                opacity: 0.5,
                boxShadow: '0 0 4px currentColor',
              }}
              animate={{
                x: [0, Math.random() * 50 - 25, 0],
                y: [0, -25, 0],
                opacity: [0.3, 0.8, 0.3],
                scale: [1, 1.4, 1],
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

        {/* Enhanced timeline gradient circles */}
        <motion.div
          className="absolute top-12 right-12 w-96 h-96 bg-amber-500/15 rounded-full blur-3xl"
          animate={{ scale: [1, 1.4, 1], opacity: [0.08, 0.2, 0.08] }}
          transition={{ duration: 18, repeat: Infinity, repeatType: "reverse" }}
        />
        <motion.div
          className="absolute bottom-12 left-12 w-80 h-80 bg-blue-500/12 rounded-full blur-3xl"
          animate={{ scale: [1, 1.3, 1], opacity: [0.06, 0.18, 0.06] }}
          transition={{ duration: 20, repeat: Infinity, repeatType: "reverse" }}
        />
        <motion.div
          className="absolute top-1/2 right-1/4 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl"
          animate={{ scale: [1, 1.2, 1], opacity: [0.05, 0.15, 0.05] }}
          transition={{ duration: 24, repeat: Infinity, repeatType: "reverse" }}
        />
      </div>

      <div className="container mx-auto px-4 relative z-10">
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