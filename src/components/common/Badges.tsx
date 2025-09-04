'use client'

import useSWR from 'swr'

const fetcher = (url: string) => fetch(url).then(r => r.json())

export default function Badges({ wallet }: { wallet: string }) {
  const { data } = useSWR(wallet ? `/api/badges?wallet=${wallet}` : null, fetcher)
  const owned = new Set((data?.user || []).map((x: any) => x.badge_key))
  const progressByType = async () => {}

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
      {(data?.catalog || []).map((b: any) => {
        const isOwned = owned.has(b.key)
        const c = b.criteria || {}
        const threshold = c.threshold || 0
        const progress = isOwned ? 100 : 0
        return (
          <div key={b.key} className={`rounded-lg p-3 border ${isOwned ? 'border-green-500/50 bg-green-500/10' : 'border-gray-700 bg-gray-800'}`}>
            <div className="text-white font-semibold">{b.name}</div>
            <div className="text-gray-400 text-sm">{b.description}</div>
            {isOwned ? (
              <div className="text-xs text-green-400 mt-1">Unlocked</div>
            ) : (
              <div className="mt-2">
                <div className="h-2 bg-gray-700 rounded">
                  <div className="h-2 bg-indigo-500 rounded" style={{width: `${progress}%`}} />
                </div>
                <div className="text-xs text-gray-500 mt-1">Progress: {progress}% {threshold ? `(goal: ${threshold})` : ''}</div>
              </div>
            )}
          </div>
        )
      })}
      {!data?.catalog?.length && (
        <div className="text-gray-500">No badges yet</div>
      )}
    </div>
  )
}
