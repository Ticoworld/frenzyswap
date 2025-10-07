'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import useResourceVerification from '@/hooks/useResourceVerification';

export default function GlobalLoader() {
  const { resourcesLoaded, progress } = useResourceVerification();
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (resourcesLoaded) {
      const timer = setTimeout(() => setIsVisible(false), 500);
      return () => clearTimeout(timer);
    }
  }, [resourcesLoaded]);

  // Fallback in case of issues
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!resourcesLoaded) {
        console.warn('Loader fallback triggered after 10 seconds');
        setIsVisible(false);
      }
    }, 10000);
    return () => clearTimeout(timer);
  }, [resourcesLoaded]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="relative w-20 h-20 mb-6">
            {/* Triple ring loader */}
            <div className="absolute inset-0 flex items-center justify-center">
              <motion.div
                className="w-16 h-16 border-4 border-brand-purple border-t-transparent rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              />
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <motion.div
                className="w-12 h-12 border-4 border-brand-purple/70 border-b-transparent rounded-full opacity-70"
                animate={{ rotate: -360 }}
                transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
              />
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <motion.div
                className="w-8 h-8 border-4 border-brand-purple/50 border-l-transparent rounded-full opacity-50"
                animate={{ rotate: 360 }}
                transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
              />
            </div>
          </div>
          
          <div className="text-brand-purple text-xl font-bold mb-4">
            {progress < 100 ? 'Loading FrenzySwap' : 'Almost Ready!'}
          </div>
          
          <div className="w-64 h-2 bg-gray-900/50 backdrop-blur-sm rounded-full overflow-hidden border border-gray-800/50">
            <motion.div 
              className="h-full bg-gradient-to-r from-brand-purple to-brand-blue"
              initial={{ width: "0%" }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
          
          <div className="mt-4 text-gray-400 text-sm">
            {progress < 100 ? (
              `Loading ${progress}%`
            ) : (
              'Finalizing your experience...'
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}