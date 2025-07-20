'use client';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { 
  FiStar, 
  FiTwitter,
  FiX
} from 'react-icons/fi';

export default function Testimonials() {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const testimonials = [
    {
      quote: "FrenzySwap made swapping tokens so easy and cost-effective. The buyback mechanism is genius!",
      author: "Alex Johnson",
      handle: "@crypto_alex",
      role: "DeFi Enthusiast",
      stars: 5
    },
    {
      quote: "I've been using FrenzySwap since day one. The team delivers on their promises and the token value keeps growing.",
      author: "Taylor Smith",
      handle: "@taytrade",
      role: "Crypto Investor",
      stars: 5
    },
    {
      quote: "The clean interface and fast transactions keep me coming back. Best Solana DEX aggregator by far!",
      author: "Jordan Williams",
      handle: "@jordannfts",
      role: "NFT Collector",
      stars: 5
    }
  ];

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <section className="py-16 bg-gray-800">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
          ref={ref}
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            What Our <span className="text-yellow-500">Community</span> Says
          </h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Join thousands of satisfied users in the MemeFrenzy ecosystem
          </p>
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          animate={inView ? "show" : "hidden"}
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
        >
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              variants={item}
              className="bg-gray-700 rounded-xl p-6 border border-gray-600 relative"
            >
              <FiX className="absolute top-6 right-6 text-gray-600 text-4xl" />
              
              <div className="flex mb-4">
                {[...Array(5)].map((_, i) => (
                  <FiStar 
                    key={i}
                    className={`w-5 h-5 ${i < testimonial.stars ? 'text-yellow-500 fill-yellow-500' : 'text-gray-500'}`}
                  />
                ))}
              </div>
              
              <p className="text-gray-300 italic mb-8">&ldquo;{testimonial.quote}&ldquo;</p>
              
              <div className="flex items-center">
                <div className="bg-gray-600 rounded-full w-12 h-12 flex items-center justify-center mr-4">
                  <span className="text-lg font-bold">{testimonial.author.charAt(0)}</span>
                </div>
                <div>
                  <div className="font-bold">{testimonial.author}</div>
                  <div className="text-gray-400">{testimonial.role}</div>
                  <a href="#" className="text-yellow-500 flex items-center text-sm mt-1">
                    <FiTwitter className="mr-1" /> {testimonial.handle}
                  </a>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}