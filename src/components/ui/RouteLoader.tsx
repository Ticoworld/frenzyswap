'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';

export default function RouteLoader() {
  const pathname = usePathname();
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    setIsActive(true);

    const timer = setTimeout(() => {
      setIsActive(false);
    }, 500); // show loader for 500ms

    return () => clearTimeout(timer);
  }, [pathname]);

  return (
    <AnimatePresence>
      {isActive && (
        <motion.div
          key="route-loader"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-40 bg-black/80 backdrop-blur-md flex items-center justify-center"
        >
          <div className="relative">
            {/* Outer ring */}
            <div className="w-16 h-16 border-4 border-brand-purple/30 border-t-brand-purple rounded-full animate-spin" />
            {/* Glow effect */}
            <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-brand-purple rounded-full animate-spin blur-sm" />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
