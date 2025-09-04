'use client'

import useSWR from 'swr'
import { motion } from 'framer-motion'
import { useWallet } from '@solana/wallet-adapter-react'
import { StreakWidget } from '@/components/common/PointsWidget'

const fetcher = (url: string) => fetch(url).then(r => r.json())

export default function SwapsPage() {
  const { publicKey } = useWallet()
  const wallet = publicKey?.toString()
  const { data } = useSWR('/api/swaps?limit=50', fetcher)
  const rows = data?.records || []

  return (
    <div className="min-h-screen bg-gray-900 py-8">
      <div className="max-w-5xl mx-auto px-4 space-y-6">
        <motion.h1 initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} className="text-3xl font-bold text-white">Swap History</motion.h1>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2 bg-gray-800 rounded-xl p-6 border border-gray-700">
            <h2 className="text-xl font-semibold text-white mb-3">Recent Swaps</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr>
                    <th className="text-left px-3 py-2 text-gray-400">Time</th>
                    <th className="text-left px-3 py-2 text-gray-400">Wallet</th>
                    <th className="text-left px-3 py-2 text-gray-400">Pair</th>
                    <th className="text-right px-3 py-2 text-gray-400">From (USD)</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r: any) => (
                    <tr key={r.id} className="border-t border-gray-700">
                      <td className="px-3 py-2 text-gray-300">{new Date(r.created_at).toLocaleString()}</td>
                      <td className="px-3 py-2 text-gray-200">{r.wallet_address.slice(0,4)}...{r.wallet_address.slice(-4)}</td>
                      <td className="px-3 py-2 text-gray-200">{r.from_token} → {r.to_token}</td>
                      <td className="px-3 py-2 text-right text-gray-100">${Number(r.from_usd_value || 0).toLocaleString()}</td>
                    </tr>
                  ))}
                  {!rows.length && (
                    <tr><td className="px-3 py-4 text-gray-500" colSpan={4}>No swaps</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <h2 className="text-xl font-semibold text-white mb-3">Your Streak</h2>
            {wallet ? <StreakWidget wallet={wallet} /> : <div className="text-gray-500">Connect wallet</div>}
            <div className="mt-6 text-gray-400 text-sm">Volume charts coming soon.</div>
          </div>
        </div>
      </div>
    </div>
  )
}
