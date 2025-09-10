// src/app/(dapp)/analytics/page.tsx
"use client";

import { useState, useEffect, useMemo } from 'react';
import { fetchTokenPrices } from '@/lib/fetchTokenPrices';
import { useVisitorStats } from '@/hooks/useVisitorStats';
import { useWallet } from '@solana/wallet-adapter-react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { FiCalendar, FiFilter, FiDownload, FiRefreshCw, FiLock } from 'react-icons/fi';
import LoaderRow from '@/components/common/LoaderRow';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip as ReTooltip,
  Legend as ReLegend,
  BarChart,
  Bar
} from 'recharts';

type Period = 'daily' | 'weekly' | 'monthly' | 'yearly';
const periodToVisitorTf = (p: Period): '24h'|'7d'|'30d'|'365d' => (
  p==='daily' ? '24h' : p==='weekly' ? '7d' : p==='monthly' ? '30d' : '365d'
);
const periodLabel = (p: Period): string => (
  p==='daily' ? '24hr' : p==='weekly' ? '1 week' : p==='monthly' ? '1 month' : '1 year'
);

interface AnalyticsKpis {
  since?: string;
  totalUsers?: number;
  invitedUsers?: number;
  activeUsers?: number;
  farmedInvites?: number;
  totalReferrals?: number;
  totalSwaps?: number;
  totalSessions?: number;
  totalPointsEvents?: number;
  totalVolumeUsd?: number;
  platformEarningsUsd?: number;
  totalMemeBurned?: number;
  uniqueWalletsCount?: number;
}

interface AggregatedUserRow {
  wallet: string;
  joinType: 'referral' | 'direct';
  status: 'active' | 'inactive';
  createdAt: string | null;
  lastActive: string | null;
}

interface SeriesBucket { ts: string; swaps: number; sessions: number; users: number; referrals: number }
interface AnalyticsSeries { resolution: 'hour'|'day'|'month'|null; buckets: SeriesBucket[] }

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
  fee_token_symbol?: string;
  fee_token_mint?: string;
  fees_paid?: string;
  from_token_mint?: string;
  to_token_mint?: string;
// ...existing code...
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
  // All hooks must be called before any return
  const [period, setPeriod] = useState<Period>('daily');
  const { stats: visitorStats, loading: visitorStatsLoading } = useVisitorStats(periodToVisitorTf(period));
  const { publicKey, connected } = useWallet();
  const [swapRecords, setSwapRecords] = useState<SwapRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [tokenPrices, setTokenPrices] = useState<{ [mint: string]: number | null }>({});
  // New: analytics KPIs
  // period moved above to feed visitor stats
  const [kpis, setKpis] = useState<AnalyticsKpis>({});
  const [kpisLoading, setKpisLoading] = useState(false);
  const [kpisError, setKpisError] = useState<string | null>(null);
  const [series, setSeries] = useState<AnalyticsSeries>({ resolution: null, buckets: [] });
  // New: users aggregation
  const [users, setUsers] = useState<AggregatedUserRow[]>([]);
  const [usersScope, setUsersScope] = useState<'all' | 'invited' | 'active' | 'waitlisted'>('all');
  const [usersPage, setUsersPage] = useState(1);
  const usersLimit = 20;
  const [usersTotal, setUsersTotal] = useState(0);
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersError, setUsersError] = useState<string | null>(null);
  const [userSearch, setUserSearch] = useState('');
  const recordsPerPage = 20;
  const authorizedWallets = getAuthorizedWallets();
  const isAuthorized = connected && publicKey && authorizedWallets.includes(publicKey.toString());
  // --- Top Tokens by Volume Leaderboard ---
  const topTokens = useMemo(() => {
    const volumeMap: { [symbol: string]: { usd: number, mint: string | undefined } } = {};
    swapRecords.forEach(rec => {
      const symbol = rec.from_token;
      const mint = rec.from_token_mint;
      const amt = parseFloat(rec.from_amount);
      const price = mint ? (tokenPrices[mint] ?? 0) : 0;
      const usd = amt * price;
      if (!symbol) return;
      if (!volumeMap[symbol]) volumeMap[symbol] = { usd: 0, mint };
      volumeMap[symbol].usd += usd;
    });
    return Object.entries(volumeMap)
      .map(([symbol, { usd, mint }]) => ({ symbol, usd, mint }))
      .sort((a, b) => b.usd - a.usd)
      .slice(0, 5);
  }, [swapRecords, tokenPrices]);


  // (Removed duplicate topTokens declaration; only top-level remains)

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

  // Fetch swap records and then fetch token prices for all unique mints
  useEffect(() => {
    if (!isAuthorized) return;
    const load = async () => {
      await fetchSwapRecords();
    };
    load();
  }, [isAuthorized]);

  // Collect all unique mints from swap records
  const allMints = useMemo(() => {
    const mints = new Set<string>();
    swapRecords.forEach((rec) => {
      if (rec.from_token_mint) mints.add(rec.from_token_mint);
      if (rec.to_token_mint) mints.add(rec.to_token_mint);
      if (rec.fee_token_mint) mints.add(rec.fee_token_mint);
    });
    return Array.from(mints).filter(Boolean);
  }, [swapRecords]);

  // Fetch token prices for all unique mints
  useEffect(() => {
    if (allMints.length === 0) return;
    let cancelled = false;
    fetchTokenPrices(allMints).then((prices) => {
      if (cancelled) return;
      const priceMap: { [mint: string]: number | null } = {};
      prices.forEach(({ mint, price }) => {
        priceMap[mint] = price;
      });
      setTokenPrices(priceMap);
    });
    return () => { cancelled = true; };
  }, [allMints]);

  // Fetch analytics KPIs
  useEffect(() => {
    if (!isAuthorized) return;
    let cancelled = false;
    const run = async () => {
      try {
        setKpisLoading(true);
        setKpisError(null);
        const res = await fetch(`/api/analytics?period=${period}`);
        if (!res.ok) throw new Error('Failed to fetch analytics');
  const json = await res.json();
        if (cancelled) return;
  setKpis(json.data || {});
  setSeries(json.series || { resolution: null, buckets: [] });
      } catch (e: any) {
        if (cancelled) return;
        setKpisError('Analytics disabled or unavailable');
  setKpis({});
  setSeries({ resolution: null, buckets: [] });
      } finally {
        if (!cancelled) setKpisLoading(false);
      }
    };
    run();
    return () => { cancelled = true; };
  }, [isAuthorized, period]);

  // Fetch aggregated users
  useEffect(() => {
    if (!isAuthorized) return;
    let cancelled = false;
    const run = async () => {
      try {
        setUsersLoading(true);
        setUsersError(null);
        const offset = (usersPage - 1) * usersLimit;
        const res = await fetch(`/api/users?scope=${usersScope}&limit=${usersLimit}&offset=${offset}`);
        if (!res.ok) throw new Error('Failed to fetch users');
        const json = await res.json();
        if (cancelled) return;
        setUsers(json.data || []);
        setUsersTotal(json.total || 0);
      } catch (e: any) {
        if (cancelled) return;
        setUsersError('Users data unavailable');
        setUsers([]);
        setUsersTotal(0);
      } finally {
        if (!cancelled) setUsersLoading(false);
      }
    };
    run();
    return () => { cancelled = true; };
  }, [isAuthorized, usersScope, usersPage]);

  const filteredUsers = useMemo(() => {
    if (!userSearch.trim()) return users;
    const q = userSearch.trim().toLowerCase();
    return users.filter(u => u.wallet.toLowerCase().includes(q));
  }, [users, userSearch]);

  const usersTotalPages = Math.max(1, Math.ceil(usersTotal / usersLimit));

  const exportUsersCsv = () => {
    const headers = ['wallet', 'joinType', 'status', 'createdAt', 'lastActive'];
    const rows = filteredUsers.map(u => [
      u.wallet,
      u.joinType,
      u.status,
      u.createdAt || '',
      u.lastActive || ''
    ]);
    const csv = [headers, ...rows].map(r => r.map(val => `"${String(val).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `users_${usersScope}_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

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


  // Helper to format USD value from token amount and mint
  const formatUsdValue = (amount: string | number | null | undefined, mint: string | undefined) => {
    if (!amount || !mint || !tokenPrices[mint]) return '-';
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    if (isNaN(num) || num === 0) return '-';
    const usd = num * (tokenPrices[mint] || 0);
    if (usd < 0.00000001) return '<$0.00000001';
    if (usd < 0.01) {
  return `$${usd.toLocaleString(undefined, { minimumFractionDigits: 6, maximumFractionDigits: 8 })}`;
    }
    return `$${usd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
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





  // (Removed duplicate topTokens declaration; only top-level remains)

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

        {/* KPI Controls */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="mb-4"
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="text-sm text-gray-400">Since: {kpis?.since ? new Date(kpis.since).toLocaleString() : '-'}</div>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <FiCalendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <select
                  value={period}
                  onChange={(e)=>{ setPeriod(e.target.value as Period); }}
                  className="pl-9 pr-3 py-2 rounded-lg bg-gray-800 border border-gray-700 text-gray-200 focus:outline-none focus:ring-2 focus:ring-pink-500"
                >
                  <option value="daily">24hr</option>
                  <option value="weekly">1 week</option>
                  <option value="monthly">1 month</option>
                  <option value="yearly">1 year</option>
                </select>
              </div>
            </div>
          </div>
        </motion.div>

        {/* KPI Cards from /api/analytics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
          className="mb-8"
        >
          {kpisError ? (
            <div className="bg-gray-800 text-red-400 border border-gray-700 rounded-lg p-4">{kpisError}</div>
          ) : (
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
              {[
        { label: `Total Users (${periodLabel(period)})`, value: kpis.totalUsers },
        { label: `Invited Users (${periodLabel(period)})`, value: kpis.invitedUsers },
        { label: `Active Users (${periodLabel(period)})`, value: kpis.activeUsers },
        { label: `Farmed Invites (${periodLabel(period)})`, value: kpis.farmedInvites },
        { label: `Referrals (${periodLabel(period)})`, value: kpis.totalReferrals },
        { label: `Swaps (${periodLabel(period)})`, value: kpis.totalSwaps },
        { label: `Sessions (${periodLabel(period)})`, value: kpis.totalSessions },
        { label: `Points Events (${periodLabel(period)})`, value: kpis.totalPointsEvents },
              ].map((k) => (
                <div key={k.label} className="bg-gray-800 rounded-xl p-5 border border-gray-700 text-center">
                  <div className="text-pink-400 text-2xl font-bold mb-1">{kpisLoading ? '…' : (k.value ?? '-')}</div>
                  <div className="text-gray-400 text-sm">{k.label}</div>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Analytics disabled notice */}
        {(!series.resolution || series.buckets.length === 0) && (
          <div className="mb-8 bg-gray-800 border border-gray-700 rounded-lg p-4 text-gray-300">
            Analytics time series are disabled or empty. Enable analytics in your environment to see charts.
          </div>
        )}

        {/* Time-series charts */}
        {series.resolution && series.buckets.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.09 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8"
          >
            {/* Swaps chart */}
            <div className="bg-gray-800 rounded-xl p-4 border border-gray-700" aria-label="Swaps over time">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-white text-sm font-semibold">Swaps</h3>
                <span className="text-xs text-gray-400">per {series.resolution}</span>
              </div>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={series.buckets} margin={{ top: 10, right: 10, bottom: 0, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="ts" tick={{ fill: '#9CA3AF', fontSize: 11 }} tickFormatter={(v)=>new Date(v).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} />
                    <YAxis tick={{ fill: '#9CA3AF', fontSize: 11 }} allowDecimals={false} />
                    <ReTooltip contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', color: '#E5E7EB' }} labelFormatter={(v)=>new Date(v).toLocaleString()} />
                    <ReLegend wrapperStyle={{ color: '#9CA3AF' }} />
                    <Bar dataKey="swaps" fill="#60A5FA" name="Swaps" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            {/* Sessions chart */}
            <div className="bg-gray-800 rounded-xl p-4 border border-gray-700" aria-label="Sessions over time">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-white text-sm font-semibold">Sessions</h3>
                <span className="text-xs text-gray-400">per {series.resolution}</span>
              </div>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={series.buckets} margin={{ top: 10, right: 10, bottom: 0, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="ts" tick={{ fill: '#9CA3AF', fontSize: 11 }} tickFormatter={(v)=>new Date(v).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} />
                    <YAxis tick={{ fill: '#9CA3AF', fontSize: 11 }} allowDecimals={false} />
                    <ReTooltip contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', color: '#E5E7EB' }} labelFormatter={(v)=>new Date(v).toLocaleString()} />
                    <ReLegend wrapperStyle={{ color: '#9CA3AF' }} />
                    <Line type="monotone" dataKey="sessions" stroke="#34D399" strokeWidth={2} dot={false} name="Sessions" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
            {/* Users chart */}
            <div className="bg-gray-800 rounded-xl p-4 border border-gray-700" aria-label="Users over time">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-white text-sm font-semibold">Users</h3>
                <span className="text-xs text-gray-400">unique per {series.resolution}</span>
              </div>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={series.buckets} margin={{ top: 10, right: 10, bottom: 0, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="ts" tick={{ fill: '#9CA3AF', fontSize: 11 }} tickFormatter={(v)=>new Date(v).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} />
                    <YAxis tick={{ fill: '#9CA3AF', fontSize: 11 }} allowDecimals={false} />
                    <ReTooltip contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', color: '#E5E7EB' }} labelFormatter={(v)=>new Date(v).toLocaleString()} />
                    <ReLegend wrapperStyle={{ color: '#9CA3AF' }} />
                    <Line type="monotone" dataKey="users" stroke="#F472B6" strokeWidth={2} dot={false} name="Users" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </motion.div>
        )}

        {/* Export analytics */}
        <div className="mb-8 flex justify-end">
          <button
            onClick={() => {
              const payload = { period, kpis, series };
              const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `analytics_${period}_${Date.now()}.json`;
              a.click();
              URL.revokeObjectURL(url);
            }}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors flex items-center gap-2"
          >
            <FiDownload className="text-sm" /> Export Analytics JSON
          </button>
        </div>

        {/* Period-scoped platform stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-12"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {/* Visits */}
            <div className="bg-gray-800 rounded-xl p-6 flex flex-col items-center border border-gray-700">
              <div className="text-pink-500 text-3xl font-bold mb-2">
                {visitorStatsLoading ? '…' : (visitorStats?.totalPageViews ?? '-')}
              </div>
              <div className="text-gray-400 text-sm">Visits ({periodLabel(period)})</div>
            </div>
            {/* Unique Visitors */}
            <div className="bg-gray-800 rounded-xl p-6 flex flex-col items-center border border-gray-700">
              <div className="text-pink-400 text-3xl font-bold mb-2">
                {visitorStatsLoading ? '…' : (visitorStats?.uniqueVisitors ?? '-')}
              </div>
              <div className="text-gray-400 text-sm">Unique Visitors ({periodLabel(period)})</div>
            </div>
            {/* Avg Time Spent */}
            <div className="bg-gray-800 rounded-xl p-6 flex flex-col items-center border border-gray-700">
              <div className="text-cyan-400 text-3xl font-bold mb-2">
                {visitorStatsLoading
                  ? '…'
                  : (visitorStats?.averageTimeSpent != null
                      ? `${Math.round(visitorStats.averageTimeSpent)}s`
                      : '-')}
              </div>
              <div className="text-gray-400 text-sm">Avg. Time Spent ({periodLabel(period)})</div>
            </div>
            {/* Total Volume (USD) */}
            <div className="bg-gray-800 rounded-xl p-6 flex flex-col items-center border border-gray-700">
              <div className="text-green-500 text-3xl font-bold mb-2">
                {kpisLoading ? '…' : (kpis.totalVolumeUsd != null ? `$${Number(kpis.totalVolumeUsd).toLocaleString(undefined, { maximumFractionDigits: 2 })}` : '-')}
              </div>
              <div className="text-gray-400 text-sm">Total Volume ({periodLabel(period)})</div>
            </div>
            {/* Total Swaps */}
            <div className="bg-gray-800 rounded-xl p-6 flex flex-col items-center border border-gray-700">
              <div className="text-blue-500 text-3xl font-bold mb-2">
                {kpisLoading ? '…' : (kpis.totalSwaps ?? '-')}
              </div>
              <div className="text-gray-400 text-sm">Total Swaps ({periodLabel(period)})</div>
            </div>
            {/* MEME Burned */}
            <div className="bg-gray-800 rounded-xl p-6 flex flex-col items-center border border-gray-700">
              <div className="text-yellow-500 text-3xl font-bold mb-2">
                {kpisLoading ? '…' : (kpis.totalMemeBurned != null ? Number(kpis.totalMemeBurned).toLocaleString(undefined, { maximumFractionDigits: 4 }) : '-')}
              </div>
              <div className="text-gray-400 text-sm">MEME Burned ({periodLabel(period)})</div>
            </div>
            {/* Platform Earnings (USD) */}
            <div className="bg-gray-800 rounded-xl p-6 flex flex-col items-center border border-gray-700">
              {kpisLoading ? (
                <div className="text-purple-500 text-3xl font-bold mb-2">…</div>
              ) : (
                (() => {
                  const total = Number(kpis.platformEarningsUsd || 0);
                  if (total > 0 && total < 0.01) {
                    return <div className="text-purple-500 text-md font-bold mb-2">${total.toLocaleString(undefined, { minimumFractionDigits: 6, maximumFractionDigits: 8 })}</div>;
                  }
                  return <div className="text-purple-500 text-3xl font-bold mb-2">{total > 0 ? `$${total.toLocaleString(undefined, { maximumFractionDigits: 2 })}` : '-'}</div>;
                })()
              )}
              <div className="text-gray-400 text-sm">Platform Earnings ({periodLabel(period)})</div>
            </div>
            {/* Unique Wallets */}
            <div className="bg-gray-800 rounded-xl p-6 flex flex-col items-center border border-gray-700">
              <div className="text-indigo-500 text-3xl font-bold mb-2">
                {kpisLoading ? '…' : (kpis.uniqueWalletsCount ?? '-')}
              </div>
              <div className="text-gray-400 text-sm">Unique Wallets ({periodLabel(period)})</div>
            </div>
          </div>
        </motion.div>

        {/* Top Tokens by Volume (USD) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12 }}
          className="mb-8"
        >
          <h2 className="text-lg font-semibold text-white mb-4">Top Tokens by Volume (USD)</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Token</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Volume (USD)</th>
                </tr>
              </thead>
              <tbody>
                {topTokens.length === 0 ? (
                  <tr><td colSpan={2} className="text-center text-gray-500 py-2">No data</td></tr>
                ) : (
                  topTokens.map(t => (
                    <tr key={t.symbol}>
                      <td className="px-4 py-2 text-white font-semibold">{t.symbol}</td>
                      <td className="px-4 py-2 text-green-400 font-mono">${t.usd.toLocaleString(undefined, { maximumFractionDigits: 2 })}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Users section powered by /api/users */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12 }}
          className="bg-gray-800 rounded-xl overflow-hidden mb-8 border border-gray-700"
        >
          <div className="p-6 border-b border-gray-700">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <h2 className="text-xl font-semibold text-white">Users</h2>
              <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
                <div className="relative">
                  <FiFilter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <select
                    value={usersScope}
                    onChange={(e)=>{ setUsersScope(e.target.value as any); setUsersPage(1); }}
                    className="pl-9 pr-3 py-2 rounded-lg bg-gray-900 border border-gray-700 text-gray-200 focus:outline-none focus:ring-2 focus:ring-pink-500"
                  >
                    <option value="all">All</option>
                    <option value="invited">Invited</option>
                    <option value="active">Active</option>
                    <option value="waitlisted">Waitlisted</option>
                  </select>
                </div>
                <input
                  value={userSearch}
                  onChange={(e)=> setUserSearch(e.target.value)}
                  placeholder="Search wallet…"
                  className="px-3 py-2 rounded-lg bg-gray-900 border border-gray-700 text-gray-200 focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
                <button
                  onClick={exportUsersCsv}
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors flex items-center gap-2"
                >
                  <FiDownload className="text-sm" /> Export
                </button>
              </div>
            </div>
          </div>
          {usersError ? (
            <div className="p-8 text-center">
              <p className="text-red-400 mb-4">{usersError}</p>
              <button
                onClick={()=>{ setUsersPage(1); setUsersScope('all'); }}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
              >Retry</button>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full" aria-busy={usersLoading ? true : undefined} aria-live="polite">
                  <thead className="bg-gray-750">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Wallet</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Join Type</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Status</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Created</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Last Active</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {/* Compact skeleton rows when paging/filtering */}
                    {usersLoading && users.length > 0 && (
                      <LoaderRow cols={5} count={3} />
                    )}
                    {filteredUsers.length === 0 ? (
                      usersLoading && users.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="px-6 py-6">
                            <div className="flex items-center justify-center gap-3 text-gray-400">
                              <div className="animate-spin w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full" />
                              Loading users…
                            </div>
                          </td>
                        </tr>
                      ) : (
                        <tr><td colSpan={5} className="px-6 py-6 text-center text-gray-500">No users</td></tr>
                      )
                    ) : (
                      filteredUsers.map(u => (
                        <tr key={u.wallet} className="hover:bg-gray-750 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{truncateAddress(u.wallet)}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300 capitalize">{u.joinType}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <span className={
                              `px-2 py-1 rounded text-xs ${u.status==='active' ? 'bg-green-900 text-green-200' : 'bg-gray-700 text-gray-300'}`
                            }>
                              {u.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">{u.createdAt ? new Date(u.createdAt).toLocaleString() : '-'}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">{u.lastActive ? new Date(u.lastActive).toLocaleString() : '-'}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
        {usersTotalPages > 1 && (
                <div className="px-6 py-4 border-t border-gray-700 flex items-center justify-between">
                  <p className="text-sm text-gray-400">Page {usersPage} of {usersTotalPages}</p>
                  <div className="flex gap-2">
                    <button
          onClick={()=> setUsersPage(p=> Math.max(1, p-1))}
          disabled={usersPage===1 || usersLoading}
                      className="px-3 py-1 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:text-gray-500 text-white rounded transition-colors"
                    >Previous</button>
                    <button
          onClick={()=> setUsersPage(p=> Math.min(usersTotalPages, p+1))}
          disabled={usersPage===usersTotalPages || usersLoading}
                      className="px-3 py-1 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:text-gray-500 text-white rounded transition-colors"
                    >Next</button>
                  </div>
                </div>
              )}
            </>
          )}
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
                        Spent (USD)
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Received (USD)
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Fees
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Fee Token
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
                          {/* Spent (USD): from_amount * from_token_mint price */}
                          {formatUsdValue(record.from_amount, record.from_token_mint)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                          {/* Received (USD): to_amount * to_token_mint price */}
                          {formatUsdValue(record.to_amount, record.to_token_mint)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                          {/* Fees: show amount, symbol, and USD value if available */}
                          {record.fees_paid && record.fee_token_symbol ? (
                            <>
                              {parseFloat(record.fees_paid).toLocaleString(undefined, { maximumFractionDigits: 6 })} {record.fee_token_symbol}
                              <span className="text-xs text-gray-500 ml-1">
                                ({formatUsdValue(record.fees_paid, record.fee_token_mint)})
                              </span>
                            </>
                          ) : (
                            <span className="text-gray-500">-</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                          {/* Fee Token column: symbol with mint as tooltip if available */}
                          {record.fee_token_symbol ? (
                            <span title={record.fee_token_mint || ''} className="cursor-help">
                              {record.fee_token_symbol}
                              {record.fee_token_mint ? (
                                <span className="text-xs text-gray-500 ml-1">({truncateAddress(record.fee_token_mint)})</span>
                              ) : null}
                            </span>
                          ) : (
                            <span className="text-gray-500">-</span>
                          )}
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
