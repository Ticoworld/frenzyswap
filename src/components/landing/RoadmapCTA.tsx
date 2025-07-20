'use client';

import Link from 'next/link';

export default function RoadmapCTA() {
  return (
    <section className="py-16 bg-gradient-to-r from-gray-800 to-gray-900">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-6">Join the Frenzy Revolution</h2>
        <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
          Be part of the meme token ecosystem that rewards participation and grows with every transaction.
        </p>
        <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
          <Link href="/swap" className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-3 px-6 rounded-lg text-center transition duration-300">
            Start Swapping Now
          </Link>
          <button className="bg-transparent border-2 border-yellow-500 text-yellow-500 hover:bg-yellow-500 hover:text-black font-bold py-3 px-6 rounded-lg transition duration-300">
            Learn About $MEME
          </button>
        </div>
      </div>
    </section>
  );
}