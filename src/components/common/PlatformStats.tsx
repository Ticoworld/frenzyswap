// src/components/common/PlatformStats.tsx
'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiRefreshCw, FiDollarSign, FiUsers, FiTrendingUp, FiZap } from 'react-icons/fi';

interface StatsData {
  totalVolume: string;
  totalSwaps: string;
  totalEarnings: string;
  memeBurned: string;
  uniqueWallets: string;
  lastUpdated: string;
}

interface PlatformStatsProps {
  showTitle?: boolean;
  compact?: boolean;
  className?: string;
}

export default function PlatformStats({ 
  showTitle = true, 
  compact = false,
  className = ""
}: PlatformStatsProps) {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/stats');
      if (!response.ok) throw new Error('Failed to fetch stats');
      const data = await response.json();
      
      // Check if analytics is configured
      if (data.status === 'analytics_not_configured') {
        // Show placeholder stats for Phase 2
        setStats({
          totalVolume: "$0",
          totalSwaps: "0",
          totalEarnings: "$0",
          memeBurned: "0 MEME",
          uniqueWallets: "0",
          lastUpdated: "Analytics Coming Soon"
        });
      } else {
        setStats(data);
      }
      setError(null);
    } catch (err) {
      console.error('Failed to fetch platform stats:', err);
      // Show placeholder stats instead of error for Phase 2
      setStats({
        totalVolume: "$0",
        totalSwaps: "0", 
        totalEarnings: "$0",
        memeBurned: "0 MEME",
        uniqueWallets: "0",
        lastUpdated: "Analytics Coming Soon"
      });
      setError(null); // Don't show error for missing Phase 2 feature
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    // Refresh stats every 5 minutes
    const interval = setInterval(fetchStats, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className={`${className}`}>
        {showTitle && (
          <h2 className="text-2xl font-bold text-center mb-8">Platform Statistics</h2>
        )}
        <div className={`grid ${compact ? 'grid-cols-2 gap-4' : 'grid-cols-2 md:grid-cols-4 gap-6'}`}>
          {Array.from({ length: compact ? 4 : 5 }).map((_, i) => (
            <div key={i} className="bg-gray-800 rounded-xl p-4 animate-pulse">
              <div className="w-8 h-8 bg-gray-700 rounded-full mb-3"></div>
              <div className="w-16 h-6 bg-gray-700 rounded mb-2"></div>
              <div className="w-20 h-4 bg-gray-700 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className={`text-center ${className}`}>
        {showTitle && (
          <h2 className="text-2xl font-bold mb-8">Platform Statistics</h2>
        )}
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6">
          <p className="text-red-400 mb-4">{error || 'Failed to load statistics'}</p>
          <button
            onClick={fetchStats}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
          >
            <FiRefreshCw className="inline mr-2" />
            Retry
          </button>
        </div>
      </div>
    );
  }

  const statsData = [
    {
      icon: <FiTrendingUp className="text-2xl" />,
      value: stats.totalVolume,
      label: "Total Volume",
      color: "text-green-500",
      bgColor: "bg-green-500/20"
    },
    {
      icon: <FiRefreshCw className="text-2xl" />,
      value: stats.totalSwaps,
      label: "Total Swaps",
      color: "text-blue-500",
      bgColor: "bg-blue-500/20"
    },
    {
      icon: <FiZap className="text-2xl" />,
      value: stats.memeBurned,
      label: "MEME Burned",
      color: "text-yellow-500",
      bgColor: "bg-yellow-500/20"
    },
    {
      icon: <FiDollarSign className="text-2xl" />,
      value: stats.totalEarnings,
      label: "Platform Earnings",
      color: "text-purple-500",
      bgColor: "bg-purple-500/20"
    },
    ...(compact ? [] : [{
      icon: <FiUsers className="text-2xl" />,
      value: stats.uniqueWallets,
      label: "Unique Wallets",
      color: "text-indigo-500",
      bgColor: "bg-indigo-500/20"
    }])
  ];

  return (
    <div className={className}>
      {showTitle && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-8"
        >
          <h2 className="text-2xl md:text-3xl font-bold mb-2 text-gray-900 dark:text-white">Platform Statistics</h2>
          <p className="text-gray-600 dark:text-gray-400">Real-time FrenzySwap performance metrics</p>
        </motion.div>
      )}

      <div className={`grid ${compact ? 'grid-cols-2 gap-4' : 'grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6'}`}>
        {statsData.map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
            viewport={{ once: true }}
            className="bg-white dark:bg-gray-800 rounded-xl p-4 lg:p-6 hover:bg-gray-50 dark:hover:bg-gray-750 transition-all duration-300 border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
          >
            <div className={`${stat.bgColor} w-12 h-12 rounded-full flex items-center justify-center mb-4`}>
              <div className={stat.color}>
                {stat.icon}
              </div>
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
              {stat.value}
            </div>
            <div className="text-gray-600 dark:text-gray-400 text-sm">
              {stat.label}
            </div>
          </motion.div>
        ))}
      </div>

      {stats.lastUpdated && (
        <p className="text-xs text-gray-500 dark:text-gray-500 text-center mt-4">
          Last updated: {new Date(stats.lastUpdated).toLocaleString()}
        </p>
      )}
    </div>
  );
}
