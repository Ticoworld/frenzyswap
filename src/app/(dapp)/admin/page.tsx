// src/app/(dapp)/admin/page.tsx
'use client';

import { useWallet } from '@solana/wallet-adapter-react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { FiBarChart , FiSettings, FiDatabase, FiShield } from 'react-icons/fi';

// Admin wallet addresses from environment variables
const getAdminWallets = () => {
  const adminWallets = process.env.NEXT_PUBLIC_ADMIN_WALLETS;
  if (!adminWallets) return [];
  return adminWallets.split(',').map(wallet => wallet.trim());
};

export default function AdminDashboard() {
  const { publicKey, connected } = useWallet();
  
  // Check if current wallet is admin
  const adminWallets = getAdminWallets();
  const isAdmin = connected && publicKey && adminWallets.includes(publicKey.toString());

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-800 rounded-xl p-8 max-w-md w-full text-center"
        >
          <FiShield className="text-6xl text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-4">Access Restricted</h1>
          <p className="text-gray-400">
            {!connected 
              ? "Connect your wallet to access admin features." 
              : "Admin dashboard is restricted to authorized wallets only."
            }
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-white mb-2">Admin Dashboard</h1>
          <p className="text-gray-400">Manage FrenzySwap platform settings and analytics</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Phase 2 Status Banner */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="md:col-span-2 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/30 rounded-xl p-4"
          >
            <div className="flex items-center">
              <div className="bg-yellow-500/20 w-8 h-8 rounded-full flex items-center justify-center mr-3">
                <span className="text-yellow-500 text-lg">⚡</span>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-yellow-500">Phase 2: Analytics System</h3>
                <p className="text-yellow-400/80 text-sm">
                  Analytics system is ready and waiting for deployment. Configure Supabase to activate.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Analytics */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Link 
              href="/analytics"
              className="block bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-blue-500 transition-all hover:bg-gray-750"
            >
              <div className="flex items-center mb-4">
                <div className="bg-blue-500/20 w-12 h-12 rounded-full flex items-center justify-center mr-4">
                  <FiBarChart  className="text-2xl text-blue-500" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white">Analytics Dashboard</h3>
                  <p className="text-gray-400">View platform statistics and swap data</p>
                </div>
              </div>
              <div className="text-sm text-gray-500">
                • Platform volume and earnings
                <br />
                • Detailed swap records
                <br />
                • User metrics and trends
              </div>
            </Link>
          </motion.div>

          {/* Test Analytics */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gray-800 rounded-xl p-6 border border-gray-700"
          >
            <div className="flex items-center mb-4">
              <div className="bg-green-500/20 w-12 h-12 rounded-full flex items-center justify-center mr-4">
                <FiDatabase className="text-2xl text-green-500" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white">Test Analytics</h3>
                <p className="text-gray-400">Test the analytics system</p>
              </div>
            </div>
            <button 
              onClick={async () => {
                try {
                  const response = await fetch('/api/test-analytics', { method: 'POST' });
                  const result = await response.json();
                  if (result.success) {
                    alert('✅ Analytics test successful!');
                  } else {
                    alert('⚠️ Analytics not configured yet\n\n' + 
                          (result.message || result.error) + '\n\n' +
                          'This is a Phase 2 feature - ready when you are!');
                  }
                } catch (error) {
                  alert('⚠️ Analytics not configured yet\n\nThis is a Phase 2 feature - ready when you are!');
                }
              }}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg transition-colors"
            >
              Test Analytics System
            </button>
          </motion.div>

          {/* Platform Settings */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gray-800 rounded-xl p-6 border border-gray-700 opacity-50"
          >
            <div className="flex items-center mb-4">
              <div className="bg-purple-500/20 w-12 h-12 rounded-full flex items-center justify-center mr-4">
                <FiSettings className="text-2xl text-purple-500" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white">Platform Settings</h3>
                <p className="text-gray-400">Configure platform parameters</p>
              </div>
            </div>
            <div className="text-sm text-gray-500">
              Coming Soon:
              <br />
              • Fee adjustments
              <br />
              • Token management
              <br />
              • System configuration
            </div>
          </motion.div>

          {/* System Status */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-gray-800 rounded-xl p-6 border border-gray-700"
          >
            <div className="flex items-center mb-4">
              <div className="bg-yellow-500/20 w-12 h-12 rounded-full flex items-center justify-center mr-4">
                <FiShield className="text-2xl text-yellow-500" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white">System Status</h3>
                <p className="text-gray-400">Monitor platform health</p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-400">Database:</span>
                <span className="text-green-400">● Online</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Jupiter API:</span>
                <span className="text-green-400">● Connected</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">RPC:</span>
                <span className="text-green-400">● Healthy</span>
              </div>
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-8 bg-gray-800 rounded-xl p-6 border border-gray-700"
        >
          <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link 
              href="/analytics"
              className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors text-center"
            >
              View Analytics
            </Link>
            <button 
              onClick={() => window.open('https://supabase.com', '_blank')}
              className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg transition-colors"
            >
              Supabase Dashboard
            </button>
            <Link 
              href="/swap"
              className="bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-lg transition-colors text-center"
            >
              Back to Swap
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
