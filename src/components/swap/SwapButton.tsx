'use client';

import { useWallet } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import { motion } from 'framer-motion';

export default function SwapButton({
  disabled,
  isLoading,
  onClick
}: {
  disabled?: boolean;
  isLoading?: boolean;
  onClick: () => void;
}) {
  const { connected } = useWallet();
  const { setVisible } = useWalletModal();

  const handleClick = () => {
    if (!connected) {
      // If wallet not connected, trigger wallet modal
      setVisible(true);
    } else {
      // If wallet connected, proceed with swap
      onClick();
    }
  };

  const getButtonText = () => {
    if (isLoading) return 'Calculating...';
    if (!connected) return 'Connect Wallet';
    if (disabled) return 'Enter Amount to Swap';
    return 'Swap Now';
  };

  const getAriaLabel = () => {
    if (isLoading) return 'Calculating swap quote, please wait';
    if (!connected) return 'Connect wallet to enable swapping';
    if (disabled) return 'Enter valid swap amount to proceed';
    return 'Execute token swap';
  };

  // Button is always enabled unless loading, but different logic for connected/disconnected
  const isButtonDisabled = isLoading || (connected && disabled);

  return (
    <motion.button
      whileHover={{ scale: isButtonDisabled ? 1 : 1.02 }}
      whileTap={{ scale: isButtonDisabled ? 1 : 0.98 }}
      className={`w-full py-3 px-4 rounded-xl font-medium transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 ${
        !connected 
          ? 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500 text-white shadow-lg focus:ring-blue-500'
          : !isButtonDisabled
          ? 'bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-400 hover:to-yellow-500 text-black shadow-lg focus:ring-yellow-500'
          : 'bg-gray-700 text-gray-400 cursor-not-allowed focus:ring-gray-500'
      } ${isLoading ? 'opacity-75' : ''}`}
      disabled={isButtonDisabled}
      onClick={handleClick}
      aria-label={getAriaLabel()}
      type="button"
    >
      {isLoading ? (
        <span className="flex items-center justify-center">
          <svg 
            className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" 
            xmlns="http://www.w3.org/2000/svg" 
            fill="none" 
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          {getButtonText()}
        </span>
      ) : (
        getButtonText()
      )}
    </motion.button>
  );
}