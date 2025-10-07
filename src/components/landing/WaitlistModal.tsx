
'use client';

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
          className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="glass-card rounded-premium border border-white/10 p-4 sm:p-6 lg:p-8 max-w-md w-full shadow-premium max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex justify-between items-start mb-4 sm:mb-6">
              <div>
                <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-2">
                  Request <span className="bg-gradient-to-r from-brand-purple to-brand-blue bg-clip-text text-transparent">Access</span>
                </h2>
                <p className="text-sm sm:text-base text-gray-400">Get notified when we open access</p>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-white transition-colors ml-4"
                aria-label="Close modal"
              >
                <FiX className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
            </div>

            {/* Beta Info */}
            <div className="bg-gradient-to-r from-brand-purple/10 to-brand-blue/10 border border-brand-purple/30 rounded-card p-3 sm:p-4 mb-4 sm:mb-6">
              <h3 className="text-brand-purple font-semibold mb-2 text-sm sm:text-base">🎯 Limited Access</h3>
              <p className="text-gray-300 text-xs sm:text-sm leading-relaxed">
                FrenzySwap is scaling gradually to ensure the best experience. Request access to be notified when we expand!
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
              className="w-full mt-4 sm:mt-6 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-medium py-2 sm:py-3 px-4 sm:px-6 rounded-card transition-all duration-300 text-sm sm:text-base"
            >
              Close
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
