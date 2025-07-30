// src/components/landing/WaitlistModal.tsx
'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX } from 'react-icons/fi';
import WaitlistForm from '@/components/auth/WaitlistForm';

interface WaitlistModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function WaitlistModal({ isOpen, onClose }: WaitlistModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-gray-800 rounded-2xl p-8 max-w-md w-full shadow-2xl border border-gray-700 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">Join Beta Waitlist</h2>
                <p className="text-gray-400">Get early access to FrenzySwap</p>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <FiX className="w-6 h-6" />
              </button>
            </div>

            {/* Beta Info */}
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 mb-6">
              <h3 className="text-yellow-500 font-semibold mb-2">🚀 Private Beta Access</h3>
              <p className="text-gray-300 text-sm">
                FrenzySwap is currently in private beta. Join our waitlist to be notified 
                when we expand access to more users!
              </p>
            </div>

            {/* Waitlist Form */}
            <WaitlistForm 
              walletAddress="" 
              source="landing_page"
              onSuccess={onClose}
            />

            {/* Close Button */}
            <button
              onClick={onClose}
              className="w-full mt-6 bg-gray-700 hover:bg-gray-600 text-white font-medium py-3 px-6 rounded-xl transition-colors"
            >
              Close
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
