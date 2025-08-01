// src/app/(dapp)/analytics/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import PlatformStats from '@/components/common/PlatformStats';
import { FiCalendar, FiFilter, FiDownload, FiRefreshCw, FiLock } from 'react-icons/fi';

interface SwapRecord {
  id: string;
  wallet_address: string;
  from_token: string;
  to_token: string;
  from_amount: string;
  to_amount: string;
  from_usd_value: string | null;
  to_usd_value: string | null;
  fees_usd_value: string | null;
  signature: string;
  created_at: string;
  meme_burned?: string;
}

// Founder/Developer wallet addresses that can access analytics
const getAuthorizedWallets = () => {
  const authorizedWallets = process.env.NEXT_PUBLIC_ANALYTICS_AUTHORIZED_WALLETS;
  if (!authorizedWallets) {
    // Fallback to admin wallets if analytics-specific env var not set
    const adminWallets = process.env.NEXT_PUBLIC_ADMIN_WALLETS;
    if (!adminWallets) return [];
    return adminWallets.split(',').map(wallet => wallet.trim());
  }
  return authorizedWallets.split(',').map(wallet => wallet.trim());
};

export default function AnalyticsPage() {
  const { publicKey, connected } = useWallet();
  const [swapRecords, setSwapRecords] = useState<SwapRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const recordsPerPage = 20;

  // Check if current wallet is authorized for analytics
  const authorizedWallets = getAuthorizedWallets();
  const isAuthorized = connected && publicKey && authorizedWallets.includes(publicKey.toString());

  const fetchSwapRecords = async (page: number = 1) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/swaps?page=${page}&limit=${recordsPerPage}`);
      if (!response.ok) throw new Error('Failed to fetch swap records');
      
      const data = await response.json();
      
      // Handle analytics not configured
      if (data.message === 'Analytics not configured yet') {
        setSwapRecords([]);
        setTotalPages(1);
        setCurrentPage(1);
        setError('Analytics system not configured yet (Phase 2 feature)');
        return;
      }
      
      setSwapRecords(data.records);
      setTotalPages(Math.ceil(data.total / recordsPerPage));
      setCurrentPage(page);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch swap records:', err);
      setError('Analytics system not configured yet (Phase 2 feature)');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthorized) {
      fetchSwapRecords();
    }
  }, [isAuthorized]);

  // If not authorized, show access denied
  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-800 rounded-xl p-8 max-w-md w-full text-center"
        >
          <FiLock className="text-6xl text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-4">Access Restricted</h1>
          <p className="text-gray-400 mb-6">
            This analytics dashboard is restricted to administrators only. 
            Please connect with an authorized wallet to access these features.
          </p>
          {!connected && (
            <p className="text-sm text-gray-500">
              Connect your wallet to verify access permissions.
            </p>
          )}
        </motion.div>
      </div>
    );
  }

  const formatCurrency = (value: string | null) => {
    if (!value || value === '0') return '-';
    const num = parseFloat(value);
    if (num < 0.01) return '<$0.01';
    return `$${num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatTokenAmount = (amount: string, decimals: number = 6) => {
    const num = parseFloat(amount);
    if (num === 0) return '0';
    if (num < 0.000001) return '<0.000001';
    return num.toLocaleString(undefined, { maximumFractionDigits: decimals });
  };

  const truncateAddress = (address: string) => {
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };

  const truncateSignature = (signature: string) => {
    return `${signature.slice(0, 8)}...${signature.slice(-8)}`;
  };

  return (
    <div className="min-h-screen bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Analytics Dashboard</h1>
              <p className="text-gray-400">Monitor FrenzySwap platform performance and swap activity</p>
            </div>
            <Link 
              href="/admin"
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors flex items-center gap-2"
            >
              ← Back to Admin
            </Link>
          </div>
        </motion.div>

        {/* Platform Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-12"
        >
          <PlatformStats showTitle={false} />
        </motion.div>

        {/* Recent Swaps */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gray-800 rounded-xl overflow-hidden"
        >
          <div className="p-6 border-b border-gray-700">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-white">Recent Swaps</h2>
              <div className="flex gap-3">
                <button
                  onClick={() => fetchSwapRecords(currentPage)}
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors flex items-center gap-2"
                >
                  <FiRefreshCw className="text-sm" />
                  Refresh
                </button>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-gray-400">Loading swap records...</p>
            </div>
          ) : error ? (
            <div className="p-8 text-center">
              <p className="text-red-400 mb-4">{error}</p>
              <button
                onClick={() => fetchSwapRecords(currentPage)}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
              >
                Retry
              </button>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-750">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Wallet
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        From → To
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        USD Value
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Fees
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        MEME Burned
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Signature
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Time
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {swapRecords.map((record) => (
                      <tr key={record.id} className="hover:bg-gray-750 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                          {truncateAddress(record.wallet_address)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                          <div className="flex items-center gap-2">
                            <span className="text-red-400">{record.from_token}</span>
                            <span>→</span>
                            <span className="text-green-400">{record.to_token}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                          <div className="space-y-1">
                            <div className="text-red-400">
                              -{formatTokenAmount(record.from_amount)}
                            </div>
                            <div className="text-green-400">
                              +{formatTokenAmount(record.to_amount)}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                          {formatCurrency(record.from_usd_value)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                          {formatCurrency(record.fees_usd_value)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-yellow-400">
                          {record.meme_burned ? formatTokenAmount(record.meme_burned) : '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-400">
                          <a
                            href={`https://solscan.io/tx/${record.signature}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:underline"
                          >
                            {truncateSignature(record.signature)}
                          </a>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                          {new Date(record.created_at).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="px-6 py-4 border-t border-gray-700 flex items-center justify-between">
                  <p className="text-sm text-gray-400">
                    Page {currentPage} of {totalPages}
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => fetchSwapRecords(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="px-3 py-1 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:text-gray-500 text-white rounded transition-colors"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => fetchSwapRecords(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="px-3 py-1 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:text-gray-500 text-white rounded transition-colors"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
}
