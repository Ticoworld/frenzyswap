'use client';

import SwapForm from '@/components/swap/SwapForm';

export default function SwapPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-950 to-black flex items-center justify-center px-4 py-20">
      <div className="w-full max-w-md relative">
        {/* Ambient glow effect */}
        <div className="absolute -inset-8 bg-brand-purple/5 blur-3xl rounded-full pointer-events-none" />
        
        {/* Swap form with relative positioning */}
        <div className="relative z-10">
          <SwapForm />
        </div>
      </div>
    </div>
  );
}
