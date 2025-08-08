// Test analytics data viewing
'use client';

import { useState, useEffect } from 'react';

interface SwapData {
  wallet_address: string;
  from_token: string;
  to_token: string;
  from_amount: number;
  to_amount: number;
  from_usd_value: number;
  to_usd_value: number;
  fees_paid: number;
  fees_usd_value: number;
  signature: string;
  block_time: number;
  created_at: string;
}

export default function AnalyticsTest() {
  const [swaps, setSwaps] = useState<SwapData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const fetchAnalytics = async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch('/api/swaps');
      if (!response.ok) {
        throw new Error(`Failed to fetch: ${response.status}`);
      }
      
      const data = await response.json();
      setSwaps(data.swaps || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Analytics Dashboard Test</h1>
        <button
          onClick={fetchAnalytics}
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          {loading ? 'Loading...' : 'Refresh'}
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          ❌ Error: {error}
        </div>
      )}

      <div className="bg-gray-50 p-4 rounded">
        <h2 className="text-lg font-semibold mb-2">Summary</h2>
        <p>Total Swaps: {swaps.length}</p>
        <p>Total Volume (USD): ${swaps.reduce((sum, swap) => sum + (swap.from_usd_value || 0), 0).toFixed(2)}</p>
        <p>Total Fees (USD): ${swaps.reduce((sum, swap) => sum + (swap.fees_usd_value || 0), 0).toFixed(4)}</p>
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Recent Swaps</h2>
        {swaps.length === 0 ? (
          <p className="text-gray-500">No swaps found</p>
        ) : (
          <div className="grid gap-4">
            {swaps.slice(0, 10).map((swap, index) => (
              <div key={index} className="bg-white border rounded-lg p-4 shadow-sm">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Swap</p>
                    <p className="font-mono text-sm">
                      {swap.from_amount} {swap.from_token} → {swap.to_amount} {swap.to_token}
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-500">USD Values</p>
                    <p className="font-mono text-sm">
                      ${swap.from_usd_value || '-'} → ${swap.to_usd_value || '-'}
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-500">Fees</p>
                    <p className="font-mono text-sm">
                      {swap.fees_paid} MEME (${swap.fees_usd_value || '-'})
                    </p>
                  </div>
                </div>
                
                <div className="mt-2 pt-2 border-t text-xs text-gray-400">
                  <p>Wallet: {swap.wallet_address.slice(0, 8)}...{swap.wallet_address.slice(-8)}</p>
                  <p>TX: {swap.signature.slice(0, 16)}...</p>
                  <p>Time: {new Date(swap.created_at).toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
