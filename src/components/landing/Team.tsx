'use client';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { 
  FiTwitter, 
  FiLinkedin, 
  FiGithub,
  FiUser
} from 'react-icons/fi';

const teamMembers = [
  {
    name: "Alex Johnson",
    role: "Founder & CEO",
    bio: "10+ years in blockchain and DeFi. Former lead at Solana Labs.",
  },
  {
    name: "Taylor Smith",
    role: "CTO",
    bio: "Expert in Solana smart contracts and high-performance systems.",
  },
  {
    name: "Jordan Williams",
    role: "Head of Design",
    bio: "UI/UX specialist with a focus on DeFi and crypto applications.",
  },
  {
    name: "Casey Brown",
    role: "Advisor",
    bio: "Tokenomics expert and advisor to multiple top 100 projects.",
  }
];

export default function Team() {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
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
            Lead <span className="text-yellow-500">Contributors</span>
          </h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Experienced builders passionate about memes and DeFi
          </p>
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          animate={inView ? "show" : "hidden"}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
        >
          {teamMembers.map((member, index) => (
            <motion.div
              key={index}
              variants={item}
              className="bg-gray-700 rounded-xl p-6 border border-gray-600 hover:border-yellow-500 transition-colors flex flex-col items-center text-center"
            >
              <div className="bg-gray-600 rounded-full w-24 h-24 flex items-center justify-center mb-6">
                <FiUser className="text-4xl text-gray-400" />
              </div>
              <h3 className="text-xl font-bold mb-2">{member.name}</h3>
              <p className="text-yellow-500 mb-4">{member.role}</p>
              <p className="text-gray-300 mb-6 flex-grow">{member.bio}</p>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-yellow-500">
                  <FiTwitter className="h-5 w-5" />
                </a>
                <a href="#" className="text-gray-400 hover:text-yellow-500">
                  <FiLinkedin className="h-5 w-5" />
                </a>
                <a href="#" className="text-gray-400 hover:text-yellow-500">
                  <FiGithub className="h-5 w-5" />
                </a>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}