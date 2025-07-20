'use client';

import { motion } from 'framer-motion';
import { FaCheck, FaExternalLinkAlt, FaArrowLeft } from 'react-icons/fa';
import { useRouter } from 'next/navigation';

interface TransactionPageProps {
  params: { txHash: string };
  searchParams: {
    fromToken?: string;
    toToken?: string;
    fromAmount?: string;
    toAmount?: string;
  };
}

export default function TransactionPage({
  params,
  searchParams,
}: TransactionPageProps) {
  const router = useRouter();
  const explorerUrl = `https://solscan.io/tx/${params.txHash}?cluster=mainnet-beta`;

  const handleBackToSwap = () => {
    router.push('/swap');
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-md mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-800 rounded-2xl p-6 shadow-xl border border-gray-700"
        >
          {/* Success Header */}
          <div className="flex flex-col items-center justify-center mb-6">
            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mb-4">
              <FaCheck className="text-green-500 text-2xl" />
            </div>
            <h1 className="text-2xl font-bold mb-1">Swap Completed!</h1>
            <p className="text-gray-400 text-sm">Your transaction was successful</p>
          </div>

          {/* Swap Details */}
          {searchParams.fromToken && searchParams.toToken && (
            <div className="bg-gray-900 rounded-xl p-4 border border-gray-600 mb-6">
              <div className="flex justify-between items-center mb-4">
                <span className="text-gray-400">From</span>
                <div className="text-right">
                  <div className="font-medium">{searchParams.fromAmount} {searchParams.fromToken}</div>
                </div>
              </div>

              <div className="flex justify-center my-2">
                <div className="h-px w-8 bg-gray-600"></div>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-gray-400">To</span>
                <div className="text-right">
                  <div className="font-medium">{searchParams.toAmount} {searchParams.toToken}</div>
                </div>
              </div>
            </div>
          )}

          {/* Transaction Hash */}
          <div className="bg-gray-900 rounded-xl p-4 border border-gray-600 mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-400">Transaction</span>
              <a 
                href={explorerUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-yellow-500 hover:text-yellow-400 text-sm flex items-center transition-colors"
              >
                View on Solscan <FaExternalLinkAlt className="ml-1 text-xs" />
              </a>
            </div>
            <div className="text-xs font-mono text-gray-300 break-all">
              {params.txHash}
            </div>
          </div>

          {/* Burn Notice */}
          <div className="bg-gradient-to-r from-yellow-500/10 to-yellow-600/10 border border-yellow-500/30 rounded-xl p-3 text-center text-yellow-500 text-sm mb-6">
            🔥 A portion of fees has been used to buyback and burn MEME tokens
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={handleBackToSwap}
              className="w-full py-3 px-4 bg-yellow-500 hover:bg-yellow-400 text-black font-medium rounded-xl transition-colors"
            >
              Make Another Swap
            </button>
            
            <button
              onClick={() => router.back()}
              className="w-full py-3 px-4 bg-gray-700 hover:bg-gray-600 text-white font-medium rounded-xl transition-colors flex items-center justify-center"
            >
              <FaArrowLeft className="mr-2" />
              Go Back
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
