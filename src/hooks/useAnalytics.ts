// src/hooks/useAnalytics.ts
'use client';

import { useEffect, useRef } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { usePathname } from 'next/navigation';
import { 
  trackPageView, 
  trackWalletConnection, 
  trackTimeSpent,
  getSessionId 
} from '@/lib/analytics';

export function useAnalytics() {
  const pathname = usePathname();
  const pageStartTime = useRef(Date.now());
  const hasTrackedConnection = useRef(false);
  
  // Always call useWallet, but handle errors gracefully
  let publicKey: any = null;
  let connected: boolean = false;
  let wallet: any = null;
  
  try {
    const walletContext = useWallet();
    publicKey = walletContext.publicKey;
    connected = walletContext.connected;
    wallet = walletContext.wallet;
  } catch (error) {
    // Wallet context is not available
    console.warn('Wallet context not available for analytics:', error);
  }

  // Track page views
  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return;
    
    pageStartTime.current = Date.now();
    
    // Track page view
    trackPageView(pathname, publicKey?.toString());

    // Setup cleanup function for time tracking
    return () => {
      const cleanup = trackTimeSpent(pageStartTime.current);
      cleanup(); // Call the async cleanup function
    };
  }, [pathname, publicKey]);

  // Track wallet connections
  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return;
    
    if (connected && publicKey && wallet && !hasTrackedConnection.current) {
      // Check if this is first connection for this session
      const sessionId = getSessionId();
      const isFirstConnection = !sessionStorage.getItem('wallet_connected');
      
      trackWalletConnection(
        publicKey.toString(),
        wallet.adapter.name,
        isFirstConnection
      );

      // Mark as connected for this session
      sessionStorage.setItem('wallet_connected', 'true');
      hasTrackedConnection.current = true;
    }

    // Reset tracking flag when wallet disconnects
    if (!connected) {
      hasTrackedConnection.current = false;
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem('wallet_connected');
      }
    }
  }, [connected, publicKey, wallet]);

  return {
    sessionId: typeof window !== 'undefined' ? getSessionId() : null,
    isTracking: typeof window !== 'undefined'
  };
}

// Hook for tracking custom events
export function useCustomAnalytics() {
  return {
    trackPageView,
    trackWalletConnection,
    trackTimeSpent
  };
}
