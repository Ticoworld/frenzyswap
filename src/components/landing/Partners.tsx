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
    { name: "Solana", logo: "/assets/partners/solana.png" },
    { name: "Jupiter", logo: "/assets/partners/jupiter.png" },
    { name: "Raydium", logo: "/assets/partners/raydium.png" },
    { name: "Serum", logo: "/assets/partners/serum.png" },
    { name: "Phantom", logo: "/assets/partners/phantom.svg" },
    { name: "CoinGecko", logo: "/assets/partners/coingecko.png" },
  ];

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, scale: 0.8 },
    show: { opacity: 1, scale: 1 },
  };

  return (
    <section className="py-16 bg-gray-900">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
          ref={ref}
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Our <span className="text-yellow-500">Partners</span>
          </h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Trusted by leading projects in the Solana ecosystem
          </p>
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          animate={inView ? "show" : "hidden"}
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 items-center"
        >
          {partners.map((partner, index) => (
            <motion.div
              key={index}
              variants={item}
              className="flex justify-center"
            >
              <motion.div 
                className="bg-gray-800 rounded-xl p-6 flex items-center justify-center h-24 w-full hover:bg-gray-700 transition-colors"
                whileHover={{ 
                  y: -5,
                  boxShadow: "0 10px 25px -5px rgba(250, 204, 21, 0.1), 0 10px 10px -5px rgba(250, 204, 21, 0.04)"
                }}
              >
                <Image 
                  src={partner.logo}
                  alt={partner.name}
                  width={120}
                  height={40}
                  className="object-contain max-h-12 opacity-80 hover:opacity-100 transition-opacity"
                />
              </motion.div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}