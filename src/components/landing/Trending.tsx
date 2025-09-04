'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { FiTrendingUp, FiBarChart2, FiZap, FiClock } from 'react-icons/fi';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';
import { useTopPairs, useTopTokens, useTopHours, useBiggestSwaps, useMemeAggregates, useTopProjects } from '@/hooks/useTopAnalytics';

type TF = '24h' | '7d' | '30d';

function num(n: number | undefined | null, opts: Intl.NumberFormatOptions = {}) {
  const v = typeof n === 'number' ? n : Number(n || 0);
  return new Intl.NumberFormat(undefined, { maximumFractionDigits: 0, ...opts }).format(v);
}

function MiniBar({ pct, color = 'bg-indigo-500' }: { pct: number; color?: string }) {
  const width = Math.max(4, Math.min(100, Math.round(pct)));
  return (
    <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded">
      <div className={`h-2 ${color} rounded`} style={{ width: `${width}%` }} />
    </div>
  );
}

export default function Trending() {
  const [tf, setTf] = useState<TF>('7d');

  const { data: pairs, isLoading: loadingPairs } = useTopPairs(tf, 8);
  const { data: tokens, isLoading: loadingTokens } = useTopTokens(tf, 8);
  const { data: hours, isLoading: loadingHours } = useTopHours(tf);
  const { data: projects, isLoading: loadingProjects } = useTopProjects(tf, 8);
  const { data: biggest, isLoading: loadingBig } = useBiggestSwaps(tf, 6);
  const { data: meme } = useMemeAggregates(tf);

  const maxPair = useMemo(() => Math.max(1, ...pairs.map((p: any) => p.volume || p.volumeUsd || 0)), [pairs]);
  const maxToken = useMemo(() => Math.max(1, ...tokens.map((t: any) => t.volume || t.volumeUsd || 0)), [tokens]);
  const maxProject = useMemo(() => Math.max(1, ...projects.map((p: any) => p.volume || 0)), [projects]);
  const maxHour = useMemo(() => Math.max(1, ...hours.map((h: any) => h.volume || 0)), [hours]);

  const tabs: { key: TF; label: string }[] = [
    { key: '24h', label: '24h' },
    { key: '7d', label: '7d' },
    { key: '30d', label: '30d' },
  ];

  return (
    <section className="py-16 bg-white dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8"
        >
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
              <FiTrendingUp className="text-yellow-500" /> Trending now
            </h2>
            <p className="text-gray-600 dark:text-gray-400">Live on-chain activity across FrenzySwap</p>
          </div>
          <div className="inline-flex rounded-xl border border-gray-200 dark:border-gray-700 p-1 bg-gray-50 dark:bg-gray-800">
            {tabs.map(t => (
              <button
                key={t.key}
                onClick={() => setTf(t.key)}
                className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                  tf === t.key
                    ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-white/70 dark:hover:bg-gray-700/60'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Top pairs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-5"
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <FiBarChart2 /> Top pairs
              </h3>
              <span className="text-xs text-gray-500">by USD volume</span>
            </div>
            {loadingPairs ? (
              <p className="text-sm text-gray-500">Loading…</p>
            ) : pairs.length ? (
              <ul className="space-y-2">
                {pairs.map((p: any) => (
                  <li key={p.pair} className="text-sm">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-gray-800 dark:text-gray-200 mr-2 truncate">{p.pair}</span>
                      <span className="text-xs text-gray-500">${num(p.volume)}</span>
                    </div>
                    <MiniBar pct={(p.volume / maxPair) * 100} />
                    <div className="text-[11px] text-gray-500 mt-1">{num(p.trades)} trades · {num(p.traders)} traders · ${num(p.fees)} fees</div>
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyState label="Analytics coming soon" />
            )}
          </motion.div>

          {/* Top tokens */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55 }}
            className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-5"
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <FiBarChart2 /> Top tokens
              </h3>
              <span className="text-xs text-gray-500">by USD volume</span>
            </div>
            {loadingTokens ? (
              <p className="text-sm text-gray-500">Loading…</p>
            ) : tokens.length ? (
              <ul className="space-y-2">
                {tokens.map((t: any) => (
                  <li key={t.token} className="text-sm">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-gray-800 dark:text-gray-200 mr-2 truncate">{t.token}</span>
                      <span className="text-xs text-gray-500">${num(t.volume)}</span>
                    </div>
                    <MiniBar pct={(t.volume / maxToken) * 100} color="bg-emerald-500" />
                    <div className="text-[11px] text-gray-500 mt-1">{num(t.trades)} trades · {num(t.traders)} traders · ${num(t.fees)} fees</div>
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyState label="Analytics coming soon" />
            )}
          </motion.div>

          {/* Biggest swaps */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-5"
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <FiZap /> Biggest swaps
              </h3>
              <span className="text-xs text-gray-500">top {biggest?.length || 0}</span>
            </div>
            {loadingBig ? (
              <p className="text-sm text-gray-500">Loading…</p>
            ) : biggest.length ? (
              <ul className="space-y-2">
                {biggest.map((b: any, idx: number) => (
                  <li key={`${b.wallet}-${idx}`} className="text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-800 dark:text-gray-200 mr-2 truncate">{b.pair}</span>
                      <span className="text-xs text-gray-500">${num(b.volume)}</span>
                    </div>
                    <div className="text-[11px] text-gray-500 mt-0.5">
                      {b.wallet ? `${b.wallet.slice(0, 6)}…${b.wallet.slice(-4)}` : ''} · {new Date(b.created_at).toLocaleDateString()}
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyState label="Analytics coming soon" />
            )}
          </motion.div>
        </div>

        {/* Secondary row: Projects + Hours + MEME aggregates */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-5"
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <FiBarChart2 /> Top projects
              </h3>
              <span className="text-xs text-gray-500">by USD volume</span>
            </div>
            {loadingProjects ? (
              <p className="text-sm text-gray-500">Loading…</p>
            ) : projects.length ? (
              <ul className="space-y-2">
                {projects.map((p: any) => (
                  <li key={p.project} className="text-sm">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-gray-800 dark:text-gray-200 mr-2 truncate">{p.project}</span>
                      <span className="text-xs text-gray-500">${num(p.volume)}</span>
                    </div>
                    <MiniBar pct={(p.volume / maxProject) * 100} color="bg-yellow-500" />
                    <div className="text-[11px] text-gray-500 mt-1">{num(p.trades)} trades · {num(p.traders)} traders · ${num(p.fees)} fees</div>
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyState label="Analytics coming soon" />
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55 }}
            className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-5"
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <FiClock /> Hot hours (UTC)
              </h3>
              <span className="text-xs text-gray-500">by USD volume</span>
            </div>
            {loadingHours ? (
              <p className="text-sm text-gray-500">Loading…</p>
            ) : hours.length ? (
              <div>
                <div className="w-full h-40 mb-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={hours.map((h:any)=>({ hour: `${String(h.hour).padStart(2,'0')}:00`, volume: Math.round(h.volume) }))}>
                      <XAxis dataKey="hour" tick={{ fontSize: 10 }} tickMargin={6} interval={3} stroke="#94a3b8" />
                      <YAxis tick={{ fontSize: 10 }} width={40} stroke="#94a3b8" tickFormatter={(v)=>v>1000?`${Math.round(v/1000)}k`:`${v}`} />
                      <Tooltip cursor={{ fill: 'rgba(0,0,0,0.04)' }} formatter={(v:any)=>`$${v.toLocaleString()}`} labelFormatter={(l:any)=>`Hour ${l}`} />
                      <Bar dataKey="volume" fill="#ef4444" radius={[3,3,0,0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <ul className="space-y-2">
                  {hours.map((h: any) => (
                    <li key={h.hour} className="text-sm">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-gray-800 dark:text-gray-200">{String(h.hour).padStart(2, '0')}:00</span>
                        <span className="text-xs text-gray-500">${num(h.volume)}</span>
                      </div>
                      <MiniBar pct={(h.volume / maxHour) * 100} color="bg-rose-500" />
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <EmptyState label="Analytics coming soon" />
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="bg-gradient-to-br from-yellow-50 to-white dark:from-gray-800 dark:to-gray-800/60 border border-yellow-200/60 dark:border-yellow-500/20 rounded-2xl p-5"
          >
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">MEME aggregates ({tf})</h3>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="bg-white/70 dark:bg-gray-900/30 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
                <div className="text-[11px] text-gray-500 mb-1">Volume</div>
                <div className="text-lg font-semibold text-gray-900 dark:text-white">${num(Math.round(meme.volumeUsd))}</div>
              </div>
              <div className="bg-white/70 dark:bg-gray-900/30 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
                <div className="text-[11px] text-gray-500 mb-1">Fees</div>
                <div className="text-lg font-semibold text-gray-900 dark:text-white">${num(Math.round(meme.feesUsd))}</div>
              </div>
              <div className="bg-white/70 dark:bg-gray-900/30 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
                <div className="text-[11px] text-gray-500 mb-1">Burned</div>
                <div className="text-lg font-semibold text-gray-900 dark:text-white">{num(Math.round(meme.burns))}</div>
              </div>
            </div>
            <p className="text-[11px] text-gray-500 mt-3">Privacy respected. Opted-out and private users excluded.</p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function EmptyState({ label }: { label: string }) {
  return (
    <div className="text-sm text-gray-500 dark:text-gray-400">{label}</div>
  );
}
