'use client';

import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';

type WalletButtonProps = {
  className?: string;
};

export default function WalletButton({ className }: WalletButtonProps) {
  const { connected } = useWallet();

  return (
    <div className={`wallet-adapter-button-wrapper ${className ?? ""}`}>
      <WalletMultiButton className="!bg-yellow-500 !text-black !font-medium hover:!bg-yellow-600 !rounded-lg my-2">
        {connected ? 'Connected' : 'Connect Wallet'}
      </WalletMultiButton>
    </div>
  );
}