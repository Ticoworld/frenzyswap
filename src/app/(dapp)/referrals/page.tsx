'use client'

import { useState } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import useSWR from 'swr'
import { motion } from 'framer-motion'

const fetcher = (url: string) => fetch(url).then(r => r.json())

export default function ReferralsPage() {
  const { publicKey, connected } = useWallet()
  const wallet = publicKey?.toString() || ''
  const { data, mutate } = useSWR(wallet ? `/api/referrals?wallet=${wallet}&role=referrer` : null, fetcher)
  const [referee, setReferee] = useState('')
  const [msg, setMsg] = useState<string | null>(null)

  const isPlausibleWallet = (v: string) => /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(v.trim())

  const submit = async () => {
    setMsg(null)
    if (!wallet || !referee) { setMsg('Enter referee wallet'); return }
    if (!isPlausibleWallet(referee)) { setMsg('Invalid wallet format'); return }
    const res = await fetch('/api/referrals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ referrer: wallet, referee })
    })
    const j = await res.json()
    if (!res.ok) setMsg(j.error || 'Failed')
    else { setMsg('Referral submitted'); setReferee(''); mutate() }
  }

  // Progress bar for verified referrals
  const referrals = data?.data || [];
  const verifiedCount = referrals.filter((r: any) => r.status === 'verified').length;
  const totalCount = referrals.length;
  const progress = totalCount ? Math.round((verifiedCount / totalCount) * 100) : 0;

  return (
    <div className="min-h-screen bg-gray-900 py-8">
      <div className="max-w-3xl mx-auto px-4 space-y-6">
        <motion.h1 initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} className="text-3xl font-bold text-white">Referrals</motion.h1>
        {!connected ? (
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 text-gray-400">Connect your wallet to manage referrals.</div>
        ) : (
          <>
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <h2 className="text-xl font-semibold text-white mb-2">Create Referral</h2>
              <div className="flex flex-col md:flex-row gap-3">
                <input value={referee} onChange={e=>setReferee(e.target.value)} placeholder="Referee wallet address" className={`flex-1 px-3 py-2 rounded bg-gray-900 border ${referee && !isPlausibleWallet(referee) ? 'border-red-500' : 'border-gray-700'} text-white`} aria-invalid={!!(referee && !isPlausibleWallet(referee))} />
                <button onClick={submit} className="px-4 py-2 rounded bg-indigo-600 hover:bg-indigo-500 text-white">Submit</button>
              </div>
              {msg && <div className={`text-sm mt-2 ${msg.includes('Invalid') ? 'text-red-400' : 'text-gray-400'}`}>{msg}</div>}
              <div className="mt-3 text-xs text-gray-400">Tip: Only submit wallets you trust. Fraud attempts are blocked.</div>
              <div className="mt-4 text-xs text-gray-400">
                Your referral code: <span className="font-mono bg-gray-900 px-2 py-1 rounded">{wallet.slice(0,6)}…{wallet.slice(-4)}</span>
                <button className="ml-2 underline hover:text-white" onClick={() => navigator.clipboard.writeText(`${location.origin}/login?ref=${wallet}`)}>Copy referral link</button>
              </div>
            </div>
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <h2 className="text-xl font-semibold text-white mb-2">Your Referrals</h2>
              <div className="mb-4">
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <span>Verified:</span>
                  <span className="font-bold text-green-400">{verifiedCount}</span>
                  <span>/ {totalCount}</span>
                  <span className="ml-2">Progress:</span>
                  <span className="font-bold text-indigo-400">{progress}%</span>
                </div>
                <div className="w-full h-2 bg-gray-700 rounded mt-2">
                  <div className="h-2 rounded bg-gradient-to-r from-green-400 to-indigo-500 transition-all duration-300" style={{ width: `${progress}%` }} />
                </div>
              </div>
              <div className="text-gray-300 text-sm space-y-2">
        {(referrals).map((r: any) => (
                  <div key={r.id} className="flex items-center justify-between border-b border-gray-700/50 pb-2">
          <span className="font-mono">{(r.referred_wallet || r.referee_wallet)?.slice(0,4)}...{(r.referred_wallet || r.referee_wallet)?.slice(-4)}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${r.status==='verified' ? 'bg-green-500/20 text-green-300' : r.status==='pending' ? 'bg-yellow-500/10 text-yellow-300' : 'bg-gray-500/10 text-gray-300'}`}>{r.status}</span>
                    {r.status==='verified' && <span className="ml-2 text-green-400">✓</span>}
                  </div>
                ))}
                {!referrals.length && <div className="text-gray-500">No referrals yet — invite a friend to get started.</div>}
              </div>
              <div className="mt-4 text-xs text-gray-400">
                Real-time: referrals update automatically when verified.
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
