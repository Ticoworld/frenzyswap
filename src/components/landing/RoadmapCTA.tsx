'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import WaitlistModal from './WaitlistModal';

export default function RoadmapCTA() {
  const [showWaitlistModal, setShowWaitlistModal] = useState(false);

  return (
    <section className="py-16 bg-black relative overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0 flex items-center justify-center opacity-20">
        <Image
          src="/assets/landing/revolution1.png"
          alt=""
          width={800}
          height={800}
          className="object-contain max-w-full max-h-full"
        />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold mb-6 text-white">
            Join the <span className="text-brand-purple">FrenzySwap</span> Revolution
          </h2>
          <p className="text-base sm:text-lg lg:text-xl text-gray-400 mb-12 max-w-2xl mx-auto">
            Experience professional DEX aggregation on Solana with best execution and transparent fees
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4 max-w-md mx-auto">
            <Link href="/swap" className="bg-brand-purple hover:bg-brand-purple/90 text-white px-6 py-3 rounded-xl font-semibold transition-colors text-center flex-1">
              Start Trading Now
            </Link>
            <button 
              onClick={() => setShowWaitlistModal(true)}
              className="bg-transparent border-2 border-brand-purple text-brand-purple hover:bg-brand-purple/10 px-6 py-3 rounded-xl font-semibold transition-colors flex-1"
            >
              Request Access
            </button>
          </div>
        </motion.div>
      </div>

      {/* Waitlist Modal */}
      <WaitlistModal 
        isOpen={showWaitlistModal} 
        onClose={() => setShowWaitlistModal(false)} 
      />
    </section>
  );
}