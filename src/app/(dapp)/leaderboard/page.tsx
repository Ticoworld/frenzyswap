 'use client'

import useSWR from 'swr'
import { AnimatePresence, motion } from 'framer-motion'
import { useMemo, useState } from 'react'
import { useEffect } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { supabase } from '@/lib/supabase'
import WalletAvatar from '@/components/common/WalletAvatar'

const fetcher = (url: string) => fetch(url).then(r => r.json())

export default function LeaderboardPage() {
  const [sortDir, setSortDir] = useState<'asc'|'desc'>('desc')
  const [active, setActive] = useState<'points'|'volume'|'streak'>('points')
  const [timeframe, setTimeframe] = useState<'24h'|'7d'|'30d'|'all'>('all')
  const { publicKey } = useWallet()
  const myWallet = publicKey?.toString()

  // For now timeframe is UI only until API adds support; we keep param to future-proof
  const { data: points, mutate: refetchPts, isLoading: lp } = useSWR(`/api/leaderboard?kind=points&limit=200&tf=${timeframe}`, fetcher, { refreshInterval: 15_000, revalidateOnFocus: true })
  const { data: volume, mutate: refetchVol, isLoading: lv } = useSWR(`/api/leaderboard?kind=volume&limit=200&tf=${timeframe}`, fetcher, { refreshInterval: 30_000 })
  const { data: streak, mutate: refetchStr, isLoading: ls } = useSWR(`/api/leaderboard?kind=streak&limit=200`, fetcher, { refreshInterval: 30_000 })

  // Supabase Realtime: refresh points board on new point entries
  useEffect(() => {
    if (!supabase) return
    const channel = (supabase as any)
      .channel('lb-points')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'user_points_ledger' }, () => {
        refetchPts()
      })
      .subscribe()
    return () => { try { (supabase as any).removeChannel(channel) } catch {} }
  }, [refetchPts])

  const sortRows = (rows?: { wallet: string, value: number }[]) => {
    const r = [...(rows || [])]
    r.sort((a,b)=> sortDir==='asc' ? a.value-b.value : b.value-a.value)
    return r
  }

  const Medal = ({ rank }: { rank: number }) => {
    const palette = [
      'bg-gradient-to-br from-yellow-400 to-yellow-600 text-black',
      'bg-gradient-to-br from-gray-300 to-gray-400 text-black',
      'bg-gradient-to-br from-amber-700 to-amber-900 text-white',
    ]
    return (
      <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${palette[rank-1] || 'bg-gray-700 text-white'}`}>{rank}</span>
    )
  }

  const Board = ({ title, rows, loading }: { title: string, rows?: { wallet: string, value: number }[], loading?: boolean }) => {
    const sorted = sortRows(rows)
    const myIndex = myWallet ? sorted.findIndex(r => r.wallet === myWallet) : -1
    return (
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <div className="flex items-center justify-between gap-4 mb-4">
          <h2 className="text-xl font-semibold text-white">{title}</h2>
          <div className="flex items-center gap-2 text-xs">
            {(['24h','7d','30d','all'] as const).map(tf => (
              <button key={tf} onClick={()=>setTimeframe(tf)} className={`px-2 py-1 rounded border ${timeframe===tf?'border-indigo-500 bg-indigo-600/20 text-white':'border-gray-700 text-gray-300'}`}>{tf.toUpperCase()}</button>
            ))}
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr>
                <th className="text-left px-3 py-2 text-gray-400">Rank</th>
                <th className="text-left px-3 py-2 text-gray-400">Wallet</th>
                <th className="text-right px-3 py-2 text-gray-400 cursor-pointer" onClick={()=>setSortDir(d=>d==='asc'?'desc':'asc')}>
                  Value {sortDir==='asc'?'↑':'↓'}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700/60">
              <AnimatePresence initial={false}>
                {sorted.map((r, i) => (
                  <motion.tr
                    key={r.wallet}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.15 }}
                    className={`${myWallet && r.wallet===myWallet ? 'bg-indigo-500/10' : ''}`}
                  >
                    <td className="px-3 py-2 text-gray-300"><Medal rank={i+1} /></td>
                    <td className="px-3 py-2 text-gray-200">
                      <div className="flex items-center gap-2">
                        <WalletAvatar wallet={r.wallet} />
                        <span title={r.wallet} className="font-medium">{r.wallet.slice(0, 4)}...{r.wallet.slice(-4)}</span>
                      </div>
                    </td>
                    <td className="px-3 py-2 text-right text-gray-100">{r.value.toLocaleString()}</td>
                  </motion.tr>
                ))}
              </AnimatePresence>
              {!loading && !rows?.length && (
                <tr><td className="px-3 py-6 text-center text-gray-500" colSpan={3}>No data yet. Start swapping to climb the boards!</td></tr>
              )}
              {loading && (
                <tr><td className="px-3 py-6 text-center text-gray-400" colSpan={3}>Loading leaderboard…</td></tr>
              )}
            </tbody>
          </table>
        </div>
        {myIndex> -1 && myIndex >= 10 && (
          <div className="mt-4 text-xs text-gray-400">Your rank: <span className="text-white font-semibold">#{myIndex+1}</span></div>
        )}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 py-8">
      <div className="max-w-6xl mx-auto px-4 space-y-8">
        <motion.h1 initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} className="text-3xl font-bold text-white">Leaderboards</motion.h1>
        <div className="flex gap-2">
          {(['points','volume','streak'] as const).map(k => (
            <button key={k} onClick={()=>setActive(k)} className={`px-3 py-1 rounded border ${active===k?'border-indigo-500 bg-indigo-600/20 text-white':'border-gray-700 text-gray-300'}`}>{k.toUpperCase()}</button>
          ))}
        </div>
        <div className="grid gap-6">
          {active==='points' && <Board title="Top Points" rows={points?.data} loading={lp} />}
          {active==='volume' && <Board title="Top Volume (USD)" rows={volume?.data} loading={lv} />}
          {active==='streak' && <Board title="Top Streaks (Best)" rows={streak?.data} loading={ls} />}
        </div>
      </div>
    </div>
  )
}
