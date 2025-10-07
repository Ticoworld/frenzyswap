// src/components/common/PlatformStats.tsx
'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
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
          totalVolume: "Analytics",
          totalSwaps: "In",
          totalEarnings: "Development",
          memeBurned: "Coming Soon",
          uniqueWallets: "Q1 2025",
          lastUpdated: "Analytics system in development"
        });
      } else {
        setStats(data);
      }
      setError(null);
    } catch (err) {
      console.error('Failed to fetch platform stats:', err);
      // Show placeholder stats instead of error for Phase 2
      setStats({
        totalVolume: "Analytics",
        totalSwaps: "In",
        totalEarnings: "Development",
        memeBurned: "Coming Soon",
        uniqueWallets: "Q1 2025",
        lastUpdated: "Analytics system in development"
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
          <h2 className="text-heading-xl font-bold text-center mb-8">Platform Statistics</h2>
        )}
        <div className={`grid ${compact ? 'grid-cols-2 gap-4' : 'grid-cols-2 md:grid-cols-4 gap-6'}`}>
          {Array.from({ length: compact ? 4 : 5 }).map((_, i) => (
            <div key={i} className="glass-card rounded-card p-4 animate-pulse">
              <div className="w-8 h-8 bg-surface-card rounded-full mb-3"></div>
              <div className="w-16 h-6 bg-surface-card rounded mb-2"></div>
              <div className="w-20 h-4 bg-surface-card rounded"></div>
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
          <h2 className="text-heading-xl font-bold mb-8">Platform Statistics</h2>
        )}
        <div className="glass-card rounded-card border border-red-500/20 p-6">
          <p className="text-red-400 mb-4">{error || 'Failed to load statistics'}</p>
          <button
            onClick={fetchStats}
            className="btn-secondary inline-flex items-center gap-2"
          >
            <FiRefreshCw />
            Retry
          </button>
        </div>
      </div>
    );
  }

  const statsData = [
    {
      value: stats.totalVolume,
      label: "Total Volume",
    },
    {
      value: stats.totalSwaps,
      label: "Total Swaps",
    },
    {
      value: stats.memeBurned,
      label: "Tokens Burned",
    },
    {
      value: stats.totalEarnings,
      label: "Platform Revenue",
    },
    ...(compact ? [] : [{
      value: stats.uniqueWallets,
      label: "Unique Wallets",
    }])
  ];

  return (
    <section className="py-16  bg-black relative overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/images/live-data-dashboard.png"
          alt=""
          fill
          className="object-cover opacity-10"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/60 to-black/80"></div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className={className}>
          {showTitle && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-center mb-8"
            >
              <h2 className="text-heading-xl md:text-display-sm font-bold mb-2 text-white">Platform Statistics</h2>
              <p className="text-body-md text-gray-400">Real-time FrenzySwap performance metrics</p>
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
                className="bg-black/60 backdrop-blur-sm border-2 border-gray-800/50 rounded-2xl p-4 lg:p-6 hover:border-brand-purple/30 hover:bg-black/80 transition-all duration-300"
              >
                <div className="text-2xl font-bold text-brand-purple mb-1">
                  {stat.value}
                </div>
                <div className="text-gray-400 text-sm">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>

          {stats.lastUpdated && (
            <p className="text-xs text-gray-500 text-center mt-6">
              {stats.lastUpdated}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}