'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';

export default function AnalyticsShowcase() {
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
            Real-Time <span className="text-brand-purple">Analytics</span>
          </h2>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            Track your performance with comprehensive on-chain analytics and insights
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          viewport={{ once: true }}
          className="max-w-6xl mx-auto"
        >
          {/* Full-width image showcase - No card */}
          <div className="relative w-full rounded-2xl overflow-hidden">
            <Image
              src="/assets/landing/analytics.png"
              alt="FrenzySwap Analytics Dashboard"
              width={1920}
              height={1080}
              className="w-full h-auto"
              priority
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
