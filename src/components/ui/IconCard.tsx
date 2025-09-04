'use client'
import { motion } from 'framer-motion';

export default function IconCard({
  icon,
  title,
  description,
  color = "bg-yellow-500/20",
  delay = 0
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  color?: string;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className={`${color} rounded-xl p-6 border border-gray-700 hover:border-yellow-500 transition-colors`}
    >
      <div className="text-yellow-500 mb-4 text-3xl">
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      <p className="text-gray-600 dark:text-gray-300">{description}</p>
    </motion.div>
  );
}