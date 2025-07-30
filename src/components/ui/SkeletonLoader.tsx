import { motion } from 'framer-motion';

// Professional skeleton loader with shimmer effect
export const TokenSelectorSkeleton = () => (
  <div className="bg-gray-800 border border-gray-700 rounded-xl p-4 overflow-hidden relative">
    <div className="flex items-center space-x-3">
      {/* Token icon skeleton with shimmer */}
      <div className="relative w-10 h-10 bg-gray-700 rounded-full overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-600/30 to-transparent animate-shimmer" />
      </div>
      
      <div className="flex-1 space-y-2">
        {/* Token symbol skeleton */}
        <div className="relative h-5 bg-gray-700 rounded w-20 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-600/30 to-transparent animate-shimmer" />
        </div>
        {/* Token name skeleton */}
        <div className="relative h-3 bg-gray-700 rounded w-32 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-600/30 to-transparent animate-shimmer" />
        </div>
      </div>
      
      {/* Dropdown arrow skeleton */}
      <div className="relative w-5 h-5 bg-gray-700 rounded overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-600/30 to-transparent animate-shimmer" />
      </div>
    </div>
  </div>
);

export const TokenListSkeleton = () => (
  <div className="space-y-3">
    {[...Array(5)].map((_, i) => (
      <motion.div
        key={i}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: i * 0.1, duration: 0.5 }}
        className="flex items-center w-full p-3 bg-gray-800 rounded-lg relative overflow-hidden"
      >
        {/* Token icon skeleton */}
        <div className="relative w-8 h-8 bg-gray-700 rounded-full overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-600/30 to-transparent animate-shimmer" />
        </div>
        
        <div className="ml-3 flex-1 space-y-2">
          {/* Token symbol */}
          <div className="relative h-4 w-20 bg-gray-700 rounded overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-600/30 to-transparent animate-shimmer" />
          </div>
          {/* Token name */}
          <div className="relative h-3 w-32 bg-gray-700 rounded overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-600/30 to-transparent animate-shimmer" />
          </div>
        </div>
        
        <div className="text-right space-y-2">
          {/* Price */}
          <div className="relative h-3 w-16 bg-gray-700 rounded overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-600/30 to-transparent animate-shimmer" />
          </div>
          {/* Balance */}
          <div className="relative h-3 w-20 bg-gray-700 rounded overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-600/30 to-transparent animate-shimmer" />
          </div>
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
