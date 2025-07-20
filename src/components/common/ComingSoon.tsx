'use client';


import { motion } from 'framer-motion';

interface ComingSoonProps {
  title: string;
  description: string;
  icon: React.ReactNode;
}

export function ComingSoon({ title, description, icon }: ComingSoonProps) {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="mb-8"
      >
        {icon}
      </motion.div>
      
      <motion.h1 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-3xl md:text-4xl font-bold text-center mb-4"
      >
        {title}
      </motion.h1>
      
      <motion.p
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="text-gray-400 text-center max-w-md mb-8"
      >
        {description}
      </motion.p>
      
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 text-center"
      >
        <p className="text-yellow-500">🚀 Launching soon in the MemeFrenzy ecosystem</p>
      </motion.div>
    </div>
  );
}