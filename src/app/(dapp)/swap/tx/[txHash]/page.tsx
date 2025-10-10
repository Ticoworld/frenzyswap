'use client';

import { motion } from 'framer-motion';
import { FaCheck, FaExternalLinkAlt, FaArrowLeft, FaCopy } from 'react-icons/fa';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'react-hot-toast';

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
  const [isCopying, setIsCopying] = useState(false);
  
  // Validate transaction hash format (basic validation)
  const isValidTxHash = /^[A-Za-z0-9]{64,88}$/.test(params.txHash);
  
  // Sanitize search params to prevent XSS
  const sanitizedParams = {
    fromToken: searchParams.fromToken?.replace(/[<>]/g, '') || '',
    toToken: searchParams.toToken?.replace(/[<>]/g, '') || '',
    fromAmount: searchParams.fromAmount?.replace(/[^0-9.]/g, '') || '',
    toAmount: searchParams.toAmount?.replace(/[^0-9.]/g, '') || '',
  };
  
  const explorerUrl = `https://solscan.io/tx/${params.txHash}?cluster=mainnet-beta`;

  const handleBackToSwap = () => {
    // Use replace instead of push for better navigation performance
    router.replace('/swap');
  };

  const handleCopyHash = async () => {
    if (isCopying) return;
    
    setIsCopying(true);
    try {
      await navigator.clipboard.writeText(params.txHash);
      toast.success('Transaction hash copied!');
    } catch (error) {
      toast.error('Failed to copy hash');
    } finally {
      setIsCopying(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-md">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-gray-800 rounded-2xl p-6 shadow-xl border border-gray-700"
      >
        {!isValidTxHash ? (
          <div className="text-center">
            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mb-4 mx-auto">
              <FaArrowLeft className="text-red-500 text-2xl" />
            </div>
            <h1 className="text-xl font-bold mb-2 text-red-400">Invalid Transaction</h1>
            <p className="text-gray-400 text-sm mb-6">The transaction hash appears to be invalid.</p>
            <button
              onClick={handleBackToSwap}
              className="w-full py-3 px-4 bg-brand-purple hover:bg-brand-purple/90 text-white font-medium rounded-xl transition-colors"
            >
              Back to Swap
            </button>
          </div>
        ) : (
          <>
            {/* Success Header */}
            <div className="flex flex-col items-center justify-center mb-6">
              <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mb-4">
                <FaCheck className="text-green-500 text-2xl" />
              </div>
              <h1 className="text-2xl font-bold mb-1">Swap Completed!</h1>
              <p className="text-gray-400 text-sm">Your transaction was successful</p>
            </div>

            {/* Swap Details */}
            {sanitizedParams.fromToken && sanitizedParams.toToken && (
              <div className="bg-gray-900 rounded-xl p-4 border border-gray-600 mb-6">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-gray-400">From</span>
                  <div className="text-right">
                    <div className="font-medium">{sanitizedParams.fromAmount} {sanitizedParams.fromToken}</div>
                  </div>
                </div>

                <div className="flex justify-center my-2">
                  <div className="h-px w-8 bg-gray-600"></div>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-gray-400">To</span>
                  <div className="text-right">
                    <div className="font-medium">{sanitizedParams.toAmount} {sanitizedParams.toToken}</div>
                  </div>
                </div>
              </div>
            )}          {/* Transaction Hash */}
          <div className="bg-gray-900 rounded-xl p-4 border border-gray-600 mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-400">Transaction</span>
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleCopyHash}
                  disabled={isCopying}
                  className="text-brand-purple hover:text-brand-purple/80 text-sm flex items-center transition-colors disabled:opacity-50"
                  title="Copy transaction hash"
                >
                  <FaCopy className="text-xs" />
                </button>
                <a 
                  href={explorerUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-brand-purple hover:text-brand-purple/80 text-sm flex items-center transition-colors"
                >
                  View on Solscan <FaExternalLinkAlt className="ml-1 text-xs" />
                </a>
              </div>
            </div>
            <div className="text-xs font-mono text-gray-300 break-all">
              {params.txHash}
            </div>
          </div>

          {/* Burn Notice */}
          <div className="bg-brand-purple/10 border border-brand-purple/30 rounded-xl p-3 text-center text-brand-purple text-sm mb-6">
            🔥 A portion of fees goes toward buying back and burning MEME tokens
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={handleBackToSwap}
              className="w-full py-3 px-4 bg-brand-purple hover:bg-brand-purple/90 text-white font-medium rounded-xl transition-colors"
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
          </>
        )}
        </motion.div>
    </div>
  );
}
