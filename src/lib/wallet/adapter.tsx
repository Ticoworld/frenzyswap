// src/lib/wallet/adapter.tsx - Minor clean-up recommended
'use client';

import { useMemo } from 'react';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { WalletProvider as BaseWalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import {  
  PhantomWalletAdapter,  
  SolflareWalletAdapter  
} from '@solana/wallet-adapter-wallets'; 
import { clusterApiUrl } from '@solana/web3.js'; 

require('@solana/wallet-adapter-react-ui/styles.css'); 

export function WalletProvider({ children }: { children: React.ReactNode }) { 
  const network = WalletAdapterNetwork.Mainnet; 
  const endpoint = useMemo(() => clusterApiUrl(network), [network]); 

  const wallets = useMemo( 
    () => [ 
      new PhantomWalletAdapter(), 
      new SolflareWalletAdapter({ network }), 
    ], 
    [network] 
  ); 

  return ( 
    <BaseWalletProvider wallets={wallets} autoConnect> 
      <WalletModalProvider>{children}</WalletModalProvider> 
    </BaseWalletProvider> 
  ); 
} 
