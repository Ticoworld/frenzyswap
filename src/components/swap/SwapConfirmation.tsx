"use client";
import Image from "next/image";
import { Token } from "@/config/tokens";
import { motion } from "framer-motion";
import { FaCheck, FaExternalLinkAlt } from "react-icons/fa";

interface SwapConfirmationProps {
  txHash: string;
  fromToken: Token | null;
  toToken: Token | null;
  fromAmount: string;
  toAmount: string;
  onContinue: () => void;
}

export default function SwapConfirmation({
  txHash,
  fromToken,
  toToken,
  fromAmount,
  toAmount,
  onContinue,
}: SwapConfirmationProps) {
  const explorerUrl = `https://solscan.io/tx/${txHash}?cluster=mainnet-beta`;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="py-6"
    >
      <div className="flex flex-col items-center justify-center mb-6">
        <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mb-4">
          <FaCheck className="text-green-500 text-2xl" />
        </div>
        <h3 className="text-xl font-bold mb-1">Swap Completed!</h3>
        <p className="text-gray-400 text-sm">Your transaction was successful</p>
      </div>

      <div className="bg-gray-800 rounded-xl p-4 border border-gray-700 mb-6">
        <div className="flex justify-between items-center mb-4">
          <span className="text-gray-400">From</span>
          <div className="text-right">
            <div className="font-medium">
              {fromAmount} {fromToken?.symbol}
            </div>
            {fromToken && (
              <div className="text-xs text-gray-400 flex items-center justify-end">
                <Image
                  src={fromToken.logoURI}
                  alt={fromToken.name}
                  width={16}
                  height={16}
                  className="w-4 h-4 rounded-full mr-1"
                />
                {fromToken.name}
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-center my-2">
          <div className="h-px w-8 bg-gray-600"></div>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-gray-400">To</span>
          <div className="text-right">
            <div className="font-medium">
              {toAmount} {toToken?.symbol}
            </div>
            {toToken && (
              <div className="text-xs text-gray-400 flex items-center justify-end">
                <Image
                  src={toToken.logoURI}
                  alt={toToken.name}
                  width={16}
                  height={16}
                  className="w-4 h-4 rounded-full mr-1"
                />
                {toToken.name}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="bg-gray-800 rounded-xl p-4 border border-gray-700 mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-gray-400">Transaction</span>
          <a
            href={explorerUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-brand-purple hover:text-brand-purple/80 text-sm flex items-center"
          >
            View on Solscan <FaExternalLinkAlt className="ml-1 text-xs" />
          </a>
        </div>
        <div className="text-xs font-mono text-gray-300 truncate">{txHash}</div>
      </div>

      <div className="bg-brand-purple/10 border-2 border-brand-purple/20 rounded-xl p-3 text-center text-brand-purple text-sm mb-6">
        🔥 A portion of fees has been used to buyback and burn MEME tokens
      </div>

      <button
        onClick={onContinue}
        className="w-full py-3 px-4 bg-brand-purple hover:bg-brand-purple/90 text-white font-medium rounded-xl transition-colors"
      >
        Make Another Swap
      </button>
    </motion.div>
  );
}
