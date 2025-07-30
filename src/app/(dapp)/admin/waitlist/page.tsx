// src/app/(dapp)/admin/waitlist/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FiUsers, 
  FiMail, 
  FiCalendar, 
  FiCopy, 
  FiDownload,
  FiRefreshCw,
  FiEye,
  FiEyeOff
} from 'react-icons/fi';

interface WaitlistEntry {
  _id: string;
  walletAddress: string;
  email?: string;
  source: 'denied_access' | 'landing_page';
  joinedAt: string;
  position: number;
}

interface WaitlistStats {
  total: number;
  sources: {
    denied_access: number;
    landing_page: number;
  };
  withEmail: number;
  withoutEmail: number;
}

export default function WaitlistAdminPage() {
  const [entries, setEntries] = useState<WaitlistEntry[]>([]);
  const [stats, setStats] = useState<WaitlistStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [showEmails, setShowEmails] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const fetchWaitlistData = async () => {
    try {
      setRefreshing(true);
      
      // Fetch stats
      const statsResponse = await fetch('/api/waitlist/stats');
      const statsData = await statsResponse.json();
      setStats(statsData);

      // For demo purposes, we'll create a simple admin endpoint
      // In a real app, you'd want proper authentication for this
      const entriesResponse = await fetch('/api/waitlist/admin');
      if (entriesResponse.ok) {
        const entriesData = await entriesResponse.json();
        setEntries(entriesData.entries || []);
      }
    } catch (error) {
      console.error('Failed to fetch waitlist data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchWaitlistData();
  }, []);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const exportWaitlist = () => {
    const csvContent = [
      'Position,Wallet Address,Email,Source,Joined Date',
      ...entries.map(entry => 
        `${entry.position},"${entry.walletAddress}","${entry.email || 'N/A'}","${entry.source}","${new Date(entry.joinedAt).toLocaleDateString()}"`
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `frenzyswap-waitlist-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-700 rounded w-64 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-gray-800 rounded-xl p-6 h-32"></div>
              ))}
            </div>
            <div className="bg-gray-800 rounded-xl p-6 h-96"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Waitlist Management</h1>
            <p className="text-gray-400">Monitor and manage beta waitlist signups</p>
          </div>
          
          <div className="flex gap-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={fetchWaitlistData}
              disabled={refreshing}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 disabled:opacity-50"
            >
              <FiRefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={exportWaitlist}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2"
            >
              <FiDownload className="w-4 h-4" />
              Export CSV
            </motion.button>
          </div>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gray-800 rounded-xl p-6 border border-gray-700"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm font-medium">Total Signups</p>
                  <p className="text-3xl font-bold text-white">{stats.total}</p>
                </div>
                <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                  <FiUsers className="w-6 h-6 text-blue-500" />
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-gray-800 rounded-xl p-6 border border-gray-700"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm font-medium">From Denied Access</p>
                  <p className="text-3xl font-bold text-yellow-500">{stats.sources.denied_access}</p>
                </div>
                <div className="w-12 h-12 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                  <FiUsers className="w-6 h-6 text-yellow-500" />
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-gray-800 rounded-xl p-6 border border-gray-700"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm font-medium">With Email</p>
                  <p className="text-3xl font-bold text-green-500">{stats.withEmail}</p>
                </div>
                <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                  <FiMail className="w-6 h-6 text-green-500" />
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-gray-800 rounded-xl p-6 border border-gray-700"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm font-medium">Email Rate</p>
                  <p className="text-3xl font-bold text-purple-500">
                    {stats.total > 0 ? Math.round((stats.withEmail / stats.total) * 100) : 0}%
                  </p>
                </div>
                <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
                  <FiMail className="w-6 h-6 text-purple-500" />
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* Waitlist Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden"
        >
          <div className="p-6 border-b border-gray-700">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-white">Waitlist Entries</h2>
              
              <button
                onClick={() => setShowEmails(!showEmails)}
                className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
              >
                {showEmails ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
                {showEmails ? 'Hide Emails' : 'Show Emails'}
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-700/50">
                <tr>
                  <th className="text-left py-4 px-6 text-gray-300 font-medium">#</th>
                  <th className="text-left py-4 px-6 text-gray-300 font-medium">Wallet Address</th>
                  <th className="text-left py-4 px-6 text-gray-300 font-medium">Email</th>
                  <th className="text-left py-4 px-6 text-gray-300 font-medium">Source</th>
                  <th className="text-left py-4 px-6 text-gray-300 font-medium">Joined</th>
                  <th className="text-left py-4 px-6 text-gray-300 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((entry, index) => (
                  <tr key={entry._id} className="border-b border-gray-700 hover:bg-gray-700/30">
                    <td className="py-4 px-6">
                      <span className="text-white font-medium">#{entry.position}</span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <code className="text-gray-300 text-sm bg-gray-700 px-2 py-1 rounded">
                          {entry.walletAddress.slice(0, 8)}...{entry.walletAddress.slice(-8)}
                        </code>
                        <button
                          onClick={() => copyToClipboard(entry.walletAddress)}
                          className="text-gray-400 hover:text-white"
                        >
                          <FiCopy className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      {entry.email ? (
                        <span className="text-gray-300">
                          {showEmails ? entry.email : '***@***'}
                        </span>
                      ) : (
                        <span className="text-gray-500">No email</span>
                      )}
                    </td>
                    <td className="py-4 px-6">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        entry.source === 'denied_access' 
                          ? 'bg-yellow-500/20 text-yellow-500' 
                          : 'bg-blue-500/20 text-blue-500'
                      }`}>
                        {entry.source === 'denied_access' ? 'Denied Access' : 'Landing Page'}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2 text-gray-300">
                        <FiCalendar className="w-4 h-4" />
                        {formatDate(entry.joinedAt)}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <button
                        onClick={() => copyToClipboard(entry.walletAddress)}
                        className="text-blue-400 hover:text-blue-300 text-sm font-medium"
                      >
                        Copy Wallet
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {entries.length === 0 && (
            <div className="text-center py-12">
              <FiUsers className="w-12 h-12 text-gray-500 mx-auto mb-4" />
              <p className="text-gray-400 text-lg">No waitlist entries yet</p>
              <p className="text-gray-500">Users will appear here when they join the waitlist</p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
