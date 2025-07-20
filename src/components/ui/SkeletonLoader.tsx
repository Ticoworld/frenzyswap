import { motion } from 'framer-motion';

export const TokenSelectorSkeleton = () => (
  // animate-pulse for a subtle loading animation
  <div className="animate-pulse flex items-center bg-yellow-500/20 rounded-full px-3 py-2">
    <div className="bg-yellow-500/40 rounded-full w-6 h-6 mr-2" />
    <div className="bg-yellow-500/40 h-4 w-16 rounded" />
    {/* Using an SVG for the dropdown icon directly is fine, no need for motion for static part */}
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  </div>
);

export const TokenListSkeleton = () => (
  <div className="space-y-2">
    {[...Array(5)].map((_, i) => (
      <motion.div
        key={i}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: i * 0.1, duration: 0.5 }} // Added duration for smoother fade-in
        className="flex items-center w-full p-3 bg-yellow-500/20 rounded-lg"
      >
        <div className="bg-yellow-500/40 rounded-full w-8 h-8" />
        <div className="ml-3">
          <div className="bg-yellow-500/40 h-4 w-20 rounded mb-1" /> {/* Slightly wider for text */}
          <div className="bg-yellow-500/40 h-3 w-32 rounded" /> {/* Slightly wider for text */}
        </div>
      </motion.div>
    ))}
  </div>
);

export const QuoteLoader = () => (
  <div className="flex flex-col items-center justify-center py-4">
    {/* Spin animation for visual loading feedback */}
    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-yellow-500 mb-2" />
    <p className="text-yellow-400 text-sm">Finding best price...</p>
  </div>
);

export const BalanceSkeleton = () => (
  <div className="animate-pulse flex items-center space-x-1">
    <span className="text-gray-400 text-sm">Balance:</span>
    <div className="bg-gray-600 h-3 w-20 rounded" />
  </div>
);

export const PriceImpactSkeleton = () => (
  <div className="animate-pulse flex justify-between">
    <span className="text-gray-400">Price Impact</span>
    <div className="bg-gray-600 h-3 w-12 rounded" />
  </div>
);

export const RateSkeleton = () => (
  <div className="animate-pulse flex justify-between">
    <span className="text-gray-400">Rate</span>
    <div className="bg-gray-600 h-3 w-24 rounded" />
  </div>
);

export const SwapPreviewSkeleton = () => (
  <div className="bg-gray-800 rounded-xl p-4 border border-gray-700 text-sm space-y-3 animate-pulse">
    <RateSkeleton />
    <div className="flex justify-between">
      <span className="text-gray-400">Slippage</span>
      <div className="bg-gray-600 h-3 w-8 rounded" />
    </div>
    <PriceImpactSkeleton />
    <div className="flex justify-between">
      <span className="text-gray-400">MEME Fee</span>
      <div className="bg-gray-600 h-3 w-16 rounded" />
    </div>
    <div className="flex justify-between">
      <span className="text-gray-400">Referral Fee</span>
      <div className="bg-gray-600 h-3 w-20 rounded" />
    </div>
  </div>
);
