'use client';

import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';

type WalletButtonProps = {
  className?: string;
};

export default function WalletButton({ className }: WalletButtonProps) {
  const { connected, publicKey } = useWallet();

  // Helper function to truncate wallet address
  const truncateAddress = (address: string) => {
    if (!address) return '';
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };

  const getButtonText = () => {
    if (connected && publicKey) {
      return truncateAddress(publicKey.toString());
    }
    return 'Connect Wallet';
  };

  return (
    <div className={`wallet-adapter-button-wrapper ${className ?? ""}`}>
      <WalletMultiButton className="!bg-yellow-500 !text-black !font-medium hover:!bg-yellow-600 !rounded-lg my-2">
        {getButtonText()}
      </WalletMultiButton>
    </div>
  );
}