// src/components/auth/WaitlistForm.tsx
'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { FiMail, FiUsers, FiCheck, FiAlertCircle } from 'react-icons/fi';

interface WaitlistFormProps {
  walletAddress: string;
  source: 'denied_access' | 'landing_page';
  onSuccess?: () => void;
}

export default function WaitlistForm({ walletAddress, source, onSuccess }: WaitlistFormProps) {
  const [email, setEmail] = useState('');
  const [manualWallet, setManualWallet] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [position, setPosition] = useState<number | null>(null);

  // Use provided wallet or manual input for landing page
  const effectiveWallet = walletAddress || manualWallet;
  const isLandingPage = source === 'landing_page' && !walletAddress;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validate wallet address
    if (!effectiveWallet.trim()) {
      setError('Wallet address is required');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/waitlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          walletAddress: effectiveWallet.trim(),
          email: email.trim() || undefined,
          source
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
        setPosition(data.position);
        onSuccess?.();
      } else {
        setError(data.error || 'Failed to join waitlist');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center py-6"
      >
        <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <FiCheck className="text-green-500 text-3xl" />
        </div>
        <h3 className="text-green-400 font-bold text-lg mb-2">You&apos;re on the waitlist! 🎉</h3>
        <p className="text-gray-400 text-sm mb-4">
          We&apos;ll notify you when beta access opens up.
        </p>
        {position && (
          <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3 mb-4">
            <div className="flex items-center justify-center space-x-2">
              <FiUsers className="text-green-500" />
              <span className="text-green-400 font-medium">
                Position #{position} in waitlist
              </span>
            </div>
          </div>
        )}
        <p className="text-gray-500 text-xs">
          Follow our social media for updates on public launch
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      <div className="text-center mb-4">
        <h3 className="text-white font-bold text-lg mb-2">Join the Waitlist</h3>
        <p className="text-gray-400 text-sm">
          Be the first to know when FrenzySwap opens to public
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Wallet Address */}
        {isLandingPage ? (
          <div>
            <label htmlFor="wallet" className="block text-sm text-gray-400 mb-2">
              Solana Wallet Address <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              id="wallet"
              value={manualWallet}
              onChange={(e) => setManualWallet(e.target.value)}
              placeholder="Enter your Solana wallet address"
              className="w-full bg-gray-700 text-white rounded-lg px-4 py-3 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500"
              required
            />
          </div>
        ) : (
          <div className="bg-gray-700 rounded-lg p-3">
            <label className="block text-sm text-gray-400 mb-1">Wallet Address</label>
            <div className="text-white font-mono text-sm break-all">
              {walletAddress}
            </div>
          </div>
        )}

        {/* Email Input */}
        <div>
          <label htmlFor="email" className="block text-sm text-gray-400 mb-2">
            Email <span className="text-gray-500">(optional but recommended)</span>
          </label>
          <div className="relative">
            <FiMail className="absolute left-3 top-3 text-gray-400" />
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your.email@example.com"
              className="w-full bg-gray-700 border border-gray-600 rounded-lg pl-10 pr-4 py-3 text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
            />
          </div>
          <p className="text-gray-500 text-xs mt-1">
            We&apos;ll email you when access opens (no spam, promise!)
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
            <div className="flex items-center space-x-2">
              <FiAlertCircle className="text-red-500 flex-shrink-0" />
              <span className="text-red-400 text-sm">{error}</span>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          type="submit"
          disabled={loading}
          className="w-full bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-black font-bold py-3 px-6 rounded-xl transition-colors"
        >
          {loading ? (
            <div className="flex items-center justify-center space-x-2">
              <div className="animate-spin w-4 h-4 border-2 border-black border-t-transparent rounded-full"></div>
              <span>Joining waitlist...</span>
            </div>
          ) : (
            'Join Waitlist'
          )}
        </motion.button>
      </form>

      <div className="bg-gray-900 rounded-lg p-3 text-center">
        <p className="text-gray-400 text-xs leading-relaxed">
          By joining the waitlist, you&apos;ll be among the first to access FrenzySwap when we expand beyond our current beta users.
        </p>
      </div>
    </motion.div>
  );
}
