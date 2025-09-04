'use client'

import { useWallet } from '@solana/wallet-adapter-react'
import useSWR from 'swr'
import { motion } from 'framer-motion'
import Badges from '@/components/common/Badges'
import { PointsWidget, StreakWidget } from '@/components/common/PointsWidget'
import WalletAvatar from '@/components/common/WalletAvatar'

const fetcher = (url: string) => fetch(url).then(r => r.json())

export default function ProfilePage() {
  const { publicKey, connected } = useWallet()
  const wallet = publicKey?.toString()
  const { data: pnl } = useSWR(wallet ? `/api/pnl?wallet=${wallet}` : null, fetcher)
  const { data: refs } = useSWR(wallet ? `/api/referrals?wallet=${wallet}&role=referrer` : null, fetcher)

  return (
    <div className="min-h-screen bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <motion.h1 initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} className="text-3xl font-bold text-white mb-6">Your Profile</motion.h1>
        {!connected ? (
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 text-gray-400">Connect your wallet to view stats.</div>
        ) : (
          <div className="space-y-6">
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <div className="flex items-center gap-3">
                <WalletAvatar wallet={wallet!} size={40} />
                <div>
                  <div className="text-sm text-gray-400">Wallet</div>
                  <div className="text-white font-mono">{wallet!.slice(0,6)}…{wallet!.slice(-6)}</div>
                </div>
              </div>
              <div className="grid md:grid-cols-3 gap-4 mt-4">
                <div className="bg-gray-900/40 rounded-lg p-4 border border-gray-700/60">
                  <div className="text-xs text-gray-400">Realized P&L</div>
                  <div className={`text-2xl font-semibold ${pnl?.realizedPnlUsd >= 0 ? 'text-green-400' : 'text-red-400'}`}>${(pnl?.realizedPnlUsd ?? 0).toLocaleString()}</div>
                </div>
                <div className="bg-gray-900/40 rounded-lg p-4 border border-gray-700/60">
                  <div className="text-xs text-gray-400">Total Volume</div>
                  <div className="text-2xl font-semibold text-white">${((pnl?.totalVolumeUsd ?? 0)).toLocaleString()}</div>
                </div>
                <div className="bg-gray-900/40 rounded-lg p-4 border border-gray-700/60">
                  <div className="text-xs text-gray-400">Privacy</div>
                  <div className="text-sm text-gray-300">Manage in Account menu • Leaderboards respect privacy</div>
                </div>
              </div>
            </div>
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <h2 className="text-xl font-semibold text-white mb-2">Points & Streak</h2>
              <div className="space-y-1">
                <PointsWidget wallet={wallet!} />
                <StreakWidget wallet={wallet!} />
              </div>
            </div>
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <h2 className="text-xl font-semibold text-white mb-2">Badges</h2>
              <Badges wallet={wallet!} />
            </div>
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <h2 className="text-xl font-semibold text-white mb-2">Referrals</h2>
              <div className="text-gray-300 text-sm space-y-1">
                {(refs?.data || []).map((r: any) => (
                  <div key={r.id} className="flex justify-between">
                    <span>Referee: {r.referee_wallet.slice(0,4)}...{r.referee_wallet.slice(-4)}</span>
                    <span className={r.status === 'verified' ? 'text-green-400' : 'text-gray-400'}>{r.status}</span>
                  </div>
                ))}
                {!refs?.data?.length && <div className="text-gray-500">No referrals yet</div>}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
