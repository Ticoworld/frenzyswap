'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { FiZap, FiTrendingUp, FiShield } from 'react-icons/fi';

export default function Features() {
  const features = [
    {
      icon: <FiZap className="text-3xl" />,
      title: "Lightning Fast",
      description: "Execute trades in under 300ms with optimal routing",
      image: "/assets/landing/feature-speed.png",
    },
    {
      icon: <FiTrendingUp className="text-3xl" />,
      title: "Best Rates",
      description: "Always get the best price across all Solana DEXs",
      image: "/assets/landing/feature-rate.png",
    },
    {
      icon: <FiShield className="text-3xl" />,
      title: "Secure Trading",
      description: "Non-custodial, audited, and battle-tested protocols",
      image: "/assets/landing/feature-security.png",
    }
  ];

  return (
    <section className="py-16 bg-black">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-white">
            Built for <span className="text-brand-purple">Peak Performance</span>
          </h2>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            Trade with confidence on Solana&apos;s most advanced DEX aggregator
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 max-w-7xl mx-auto">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.15 }}
              viewport={{ once: true }}
              className="group"
            >
              {/* Image - No card, direct placement */}
              <div className="relative h-48 sm:h-56 lg:h-64 mb-6 overflow-hidden rounded-2xl">
                <Image
                  src={feature.image}
                  alt={feature.title}
                  fill
                  className="object-cover"
                />
              </div>

              {/* Content - No card */}
              <div className="flex items-center gap-3 mb-3">
                <div className="text-brand-purple">
                  {feature.icon}
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-white">{feature.title}</h3>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
