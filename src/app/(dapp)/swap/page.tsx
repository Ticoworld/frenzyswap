'use client';

import { useState } from 'react';
import SwapForm from '@/components/swap/SwapForm';
import { useTokenList } from '@/hooks/useTokenList';

export default function SwapPage() {
  const [showDebug, setShowDebug] = useState(false);
  const { tokens, invalidateCache } = useTokenList();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-md mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">Swap Tokens</h1>
        
        {/* Debug Panel */}
        <div className="mb-4 p-3 bg-gray-800 rounded-lg">
          <button 
            onClick={() => setShowDebug(!showDebug)}
            className="text-sm text-gray-400 hover:text-white"
          >
            Debug Panel {showDebug ? '▼' : '▶'}
          </button>
          {showDebug && (
            <div className="mt-2 space-y-2">
              <p className="text-sm text-gray-300">Tokens loaded: {tokens.length}</p>
              <button 
                onClick={invalidateCache}
                className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
              >
                Clear Token Cache
              </button>
            </div>
          )}
        </div>

        <SwapForm />
      </div>
    </div>
  );
}
