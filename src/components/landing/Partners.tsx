'use client';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import Image from 'next/image';

export default function Partners() {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const partners = [
    { name: "Solana", logo: "/solana-sol-logo.svg" },
    { name: "Jupiter", logo: "/jupiter-ag-jup-logo.svg" },
    { name: "Raydium", logo: "/raydium-ray-logo.svg" },
    { name: "Serum", logo: "/serum-srm-logo.svg" },
  ];

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <section className="py-16 bg-black">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
          ref={ref}
        >
          <h2 className="text-display-sm md:text-display-md font-bold mb-6 text-white">
            Integration <span className="bg-gradient-to-r from-brand-purple to-brand-blue bg-clip-text text-transparent">Partners</span>
          </h2>
          <p className="text-heading-sm text-gray-400 max-w-2xl mx-auto">
            Built on top of the best protocols in the Solana ecosystem
          </p>
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          animate={inView ? "show" : "hidden"}
          className="flex flex-wrap items-center justify-center gap-12 md:gap-16 max-w-4xl mx-auto"
        >
          {partners.map((partner, index) => (
            <motion.div
              key={index}
              variants={item}
              className="flex items-center justify-center"
            >
              <Image 
                src={partner.logo}
                alt={partner.name}
                width={140}
                height={50}
                className="object-contain max-h-12 opacity-70 hover:opacity-100 transition-opacity duration-300"
              />
            </motion.div>
          ))}
        </motion.div>

        <div className="text-center mt-12">
          <p className="text-body-sm text-gray-500">
            Powered by Jupiter and Raydium for optimal execution
          </p>
        </div>
      </div>
    </section>
  );
}