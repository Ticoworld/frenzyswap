// src/app/login/page.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import { motion } from 'framer-motion';
import { FiLock, FiCheck, FiX } from 'react-icons/fi';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import WaitlistForm from '@/components/auth/WaitlistForm';

export default function LoginPage() {
  const { publicKey, connected, disconnect } = useWallet();
  const { setVisible } = useWalletModal();
  const router = useRouter();
  
  const [isChecking, setIsChecking] = useState(false);
  const [accessStatus, setAccessStatus] = useState<'checking' | 'granted' | 'denied' | null>(null);

  const checkAccess = useCallback(async () => {
    if (!publicKey) return;
    
    setIsChecking(true);
    setAccessStatus('checking');
    
    try {
      // Get allowed wallets from environment
      const allowedWallets = process.env.NEXT_PUBLIC_ALLOWED_WALLETS?.split(',') || [];
      const walletAddress = publicKey.toString();
      
      if (allowedWallets.includes(walletAddress)) {
        // Set cookie for middleware to read
        document.cookie = `connected-wallet=${walletAddress}; path=/; max-age=${60 * 60 * 24 * 7}; samesite=lax`;
        
        setAccessStatus('granted');
        
        // Redirect to intended page or default to swap with minimal delay
        setTimeout(() => {
          const urlParams = new URLSearchParams(window.location.search);
          const returnTo = urlParams.get('returnTo') || '/swap';
          console.log(`[Login] ✅ Access granted, redirecting to: ${returnTo}`);
          router.push(returnTo);
        }, 800); // Reduced from 2000ms to 800ms for faster UX
      } else {
        setAccessStatus('denied');
      }
    } catch (error) {
      console.error('Access check failed:', error);
      setAccessStatus('denied');
    } finally {
      setIsChecking(false);
    }
  }, [publicKey, router]);

  useEffect(() => {
    if (connected && publicKey) {
      checkAccess();
    } else {
      setAccessStatus(null);
    }
  }, [connected, publicKey, checkAccess]);

  // Handle wallet disconnection on protected routes
  useEffect(() => {
    if (!connected) {
      const currentPath = window.location.pathname;
      const protectedPaths = ['/swap', '/admin', '/analytics'];
      
      // If user disconnects wallet while on a protected route, clear cookies
      if (protectedPaths.some(path => currentPath.startsWith(path))) {
        document.cookie = 'connected-wallet=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      }
    }
  }, [connected]);

  const handleDisconnect = () => {
    disconnect();
    // Clear the authentication cookie
    document.cookie = 'connected-wallet=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    setAccessStatus(null);
    
    // If disconnecting from a protected route, redirect to homepage
    const currentPath = window.location.pathname;
    const protectedPaths = ['/swap', '/admin', '/analytics'];
    
    if (protectedPaths.some(path => currentPath.startsWith(path))) {
      router.push('/');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-gray-800 rounded-2xl p-8 shadow-2xl border border-gray-700"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <Image
            src="/assets/logos/frenzyswap_logomark.svg"
            alt="FrenzySwap Logo"
            width={64}
            height={64}
            className="mx-auto mb-4"
          />
          <h1 className="text-2xl font-bold text-white mb-2">FrenzySwap Beta</h1>
          <p className="text-gray-400">Private access for invited wallets only</p>
        </div>

        {/* Wallet Connection */}
        {!connected ? (
          <div className="space-y-4">
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 text-center">
              <FiLock className="text-yellow-500 text-2xl mx-auto mb-2" />
              <p className="text-yellow-500 font-medium mb-1">Invitation Required</p>
              <p className="text-gray-400 text-sm">
                Connect your whitelisted Solana wallet to access the beta
              </p>
            </div>
            
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setVisible(true)}
              className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-3 px-6 rounded-xl transition-colors"
            >
              Connect Wallet
            </motion.button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Connected Wallet Info */}
            <div className="bg-gray-700 rounded-xl p-4">
              <div className="text-sm text-gray-400 mb-2">Connected Wallet</div>
              <div className="text-white font-mono text-sm break-all mb-3">
                {publicKey?.toString()}
              </div>
              <button
                onClick={handleDisconnect}
                className="text-red-400 hover:text-red-300 text-sm underline"
              >
                Disconnect
              </button>
            </div>

            {/* Access Status */}
            {accessStatus === 'checking' && (
              <div className="text-center py-6">
                <div className="animate-spin w-8 h-8 border-2 border-yellow-500 border-t-transparent rounded-full mx-auto mb-3"></div>
                <p className="text-gray-300 font-medium">Verifying access...</p>
                <p className="text-gray-500 text-sm mt-1">Checking wallet against allowlist</p>
              </div>
            )}

            {accessStatus === 'granted' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-6"
              >
                <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FiCheck className="text-green-500 text-3xl" />
                </div>
                <p className="text-green-400 font-bold text-lg mb-2">Access Granted! 🎉</p>
                <p className="text-gray-400 text-sm mb-4">
                  Welcome to FrenzySwap Beta. Redirecting to the app...
                </p>
                <div className="flex justify-center">
                  <div className="animate-pulse flex space-x-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  </div>
                </div>
              </motion.div>
            )}

            {accessStatus === 'denied' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-6"
              >
                <div className="w-16 h-16 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FiLock className="text-yellow-500 text-3xl" />
                </div>
                <p className="text-yellow-400 font-bold text-lg mb-2">Beta Access Required</p>
                <p className="text-gray-400 text-sm mb-6">
                  FrenzySwap is currently in private beta. Join our waitlist to get early access when we expand!
                </p>
                
                {/* Waitlist Form */}
                <div className="mb-6">
                  <WaitlistForm 
                    walletAddress={publicKey?.toBase58() || ''} 
                    source="denied_access" 
                  />
                </div>
                
                {/* Back to Homepage Button */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => router.push('/')}
                  className="w-full bg-gray-700 hover:bg-gray-600 text-white font-medium py-3 px-6 rounded-xl transition-colors"
                >
                  Back to Homepage
                </motion.button>
              </motion.div>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-gray-700 text-center">
          <p className="text-gray-500 text-xs">
            FrenzySwap • Private Beta • Solana DeFi
          </p>
        </div>
      </motion.div>
    </div>
  );
}
