'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { FiArrowDown } from 'react-icons/fi';

export default function MiniSwapWidget() {
  const [fromAmount, setFromAmount] = useState('500');
  const [toAmount, setToAmount] = useState('0.2');

  return (
    <div className="w-full max-w-md mx-auto">
      <motion.div
        className="backdrop-blur-2xl border border-white/20 rounded-3xl p-4 sm:p-6 shadow-2xl shadow-brand-purple/20"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        style={{
          background: 'rgba(15, 15, 25, 0.6)',
          backdropFilter: 'blur(40px)',
          WebkitBackdropFilter: 'blur(40px)',
          boxShadow: '0 8px 32px 0 rgba(138, 43, 226, 0.15), inset 0 1px 0 0 rgba(255, 255, 255, 0.1)',
        }}
      >
        {/* From Token */}
        <div className="bg-black/30 backdrop-blur-sm rounded-2xl p-4 mb-2 border border-white/5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-gray-400">You pay</span>
            <span className="text-xs text-gray-500">Balance: 2,500</span>
          </div>
          <div className="flex items-center justify-between">
            <input
              type="text"
              value={fromAmount}
              onChange={(e) => setFromAmount(e.target.value)}
              className="bg-transparent text-2xl sm:text-3xl font-bold text-white outline-none w-1/2"
              placeholder="0.0"
            />
            <div className="flex items-center gap-2 bg-gray-900 rounded-xl px-3 py-2">
              <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-bold">
                $
              </div>
              <span className="text-white font-semibold">USDC</span>
            </div>
          </div>
        </div>

        {/* Swap Arrow */}
        <div className="flex justify-center -my-2 relative z-10">
          <div className="bg-brand-purple/90 backdrop-blur-sm rounded-xl p-2 border border-brand-purple/30">
            <FiArrowDown className="text-white text-xl" />
          </div>
        </div>

        {/* To Token */}
        <div className="bg-black/30 backdrop-blur-sm rounded-2xl p-4 mb-4 border border-white/5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-gray-400">You receive</span>
          </div>
          <div className="flex items-center justify-between">
            <input
              type="text"
              value={toAmount}
              onChange={(e) => setToAmount(e.target.value)}
              className="bg-transparent text-2xl sm:text-3xl font-bold text-white outline-none w-1/2"
              placeholder="0.0"
            />
            <div className="flex items-center gap-2 bg-gray-900 rounded-xl px-3 py-2">
              <Image
                src="/meme-logo.png"
                alt="MEME"
                width={24}
                height={24}
                className="rounded-full"
              />
              <span className="text-white font-semibold">MEME</span>
            </div>
          </div>
        </div>

        {/* Swap Button */}
        <button className="w-full bg-brand-purple hover:bg-brand-purple/90 text-white font-bold py-4 rounded-xl transition-all duration-300">
          Swap
        </button>

        {/* Routing Info */}
        <div className="mt-4 flex items-center justify-center gap-2 text-xs text-gray-500">
          <span>Routed via</span>
          <span className="text-brand-purple font-semibold">Jupiter Protocol</span>
        </div>
      </motion.div>
    </div>
  );
}