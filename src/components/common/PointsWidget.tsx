'use client'

import useSWR from 'swr'

const fetcher = (url: string) => fetch(url).then(r => r.json())

export function PointsWidget({ wallet }: { wallet: string }) {
  const { data } = useSWR('/api/leaderboard?kind=points&limit=1000', fetcher)
  const total = (data?.data || [])
    .filter((x: any) => x.wallet === wallet)
    .reduce((acc: number, x: any) => acc + (x.value || 0), 0)
  return <div className="text-white">Total Points: <span className="text-green-400">{(total || 0).toLocaleString()}</span></div>
}

export function StreakWidget({ wallet }: { wallet: string }) {
  const { data } = useSWR(wallet ? `/api/leaderboard?kind=streak&limit=1000` : null, fetcher)
  const mine = (data?.data || []).find((x: any) => x.wallet === wallet)
  return <div className="text-white">Best Streak: <span className="text-yellow-400">{mine?.value || 0} days</span></div>
}
