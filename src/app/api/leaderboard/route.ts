import { NextRequest, NextResponse } from 'next/server'
import { getLeaderboard } from '@/lib/gamification'

// GET /api/leaderboard?kind=points|volume|streak&limit=50
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const kind = (url.searchParams.get('kind') as 'points' | 'volume' | 'streak') || 'points'
    const limit = Math.min(parseInt(url.searchParams.get('limit') || '50', 10), 100)
  const live = url.searchParams.get('live') === '1'
  const tf = (url.searchParams.get('tf') || 'all').toLowerCase()
  let since: Date | undefined
  if (tf === '24h') since = new Date(Date.now() - 24 * 60 * 60 * 1000)
  if (tf === '7d') since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  if (tf === '30d') since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
  const data = await getLeaderboard(kind, limit, { live, timeframeSince: since })
    return NextResponse.json({ kind, data })
  } catch (e) {
    console.error('/api/leaderboard error:', e)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
