'use client';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

export default function AnimatedCounter({
  value,
  suffix = "",
  prefix = "",
  duration = 2
}: {
  value: number;
  suffix?: string;
  prefix?: string;
  duration?: number;
}) {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0 }}
      animate={inView ? { opacity: 1 } : { opacity: 0 }}
    >
      <motion.span
        initial={{ opacity: 0 }}
        animate={inView ? { opacity: 1 } : { opacity: 0 }}
      >
        {prefix}
      </motion.span>
      <motion.span
        initial={{ opacity: 0 }}
        animate={inView ? { opacity: 1 } : { opacity: 0 }}
        transition={{ duration }}
      >
        {inView ? value : 0}
      </motion.span>
      <motion.span
        initial={{ opacity: 0 }}
        animate={inView ? { opacity: 1 } : { opacity: 0 }}
      >
        {suffix}
      </motion.span>
    </motion.div>
  );
}
