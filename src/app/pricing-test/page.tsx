// Test pricing functionality
'use client';

import { useState } from 'react';
import { getTokenPrice, getTokenPrices, calculateUsdValue } from '@/lib/pricing';

export default function PricingTest() {
  const [result, setResult] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const testPricing = async () => {
    setLoading(true);
    setResult('');
    
    try {
      // Test individual prices
      const solPrice = await getTokenPrice('So11111111111111111111111111111111111111112');
      const usdcPrice = await getTokenPrice('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v');
      const memePrice = await getTokenPrice('94fzsMkuHAuFP4J8iMZS43euWr2CLtuvwLgyjPHyqcnY');

      // Test batch prices
      const batchPrices = await getTokenPrices([
        'So11111111111111111111111111111111111111112', // SOL
        'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', // USDC
        '94fzsMkuHAuFP4J8iMZS43euWr2CLtuvwLgyjPHyqcnY', // MEME
      ]);

      // Test USD calculations
      const usdValue1 = calculateUsdValue(1000000, solPrice, 9); // 1 SOL
      const usdValue2 = calculateUsdValue(1000000, usdcPrice, 6); // 1 USDC
      const usdValue3 = calculateUsdValue(1000000, memePrice, 6); // 1 MEME

      setResult(`
🔍 Individual Prices:
• SOL: $${solPrice}
• USDC: $${usdcPrice}
• MEME: $${memePrice}

📊 Batch Prices:
${JSON.stringify(batchPrices, null, 2)}

💰 USD Value Calculations:
• 1 SOL = $${usdValue1.toFixed(2)}
• 1 USDC = $${usdValue2.toFixed(2)}
• 1 MEME = $${usdValue3.toFixed(6)}
      `);
    } catch (error) {
      setResult(`❌ Error: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-bold">Pricing System Test</h1>
      
      <button
        onClick={testPricing}
        disabled={loading}
        className="bg-purple-600 text-white px-4 py-2 rounded disabled:opacity-50"
      >
        {loading ? 'Testing...' : 'Test Pricing'}
      </button>

      {result && (
        <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto whitespace-pre-wrap">
          {result}
        </pre>
      )}
    </div>
  );
}
