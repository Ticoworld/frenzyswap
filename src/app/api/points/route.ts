import { NextRequest, NextResponse } from 'next/server'
import { awardPoints, logEvent } from '@/lib/gamification'
import { isAnalyticsEnabled } from '@/lib/supabase'
import { checkRateLimit } from '@/lib/auth'

// POST /api/points { wallet, points, reason, metadata }
export async function POST(request: NextRequest) {
  try {
    if (!isAnalyticsEnabled()) {
      return NextResponse.json({ error: 'Analytics not configured' }, { status: 503 })
    }
    const body = await request.json()
    const { wallet, points, reason, metadata } = body
    if (!wallet || !points || !reason) {
      return NextResponse.json({ error: 'wallet, points, reason required' }, { status: 400 })
    }
    if (!checkRateLimit(`points:${wallet}`, 10, 60_000)) {
      return NextResponse.json({ error: 'Rate limited' }, { status: 429 })
    }
  const res = await awardPoints({ wallet, points, reason, metadata })
    await logEvent({ event_type: 'points_awarded', wallet_address: wallet, metadata: { points, reason, ...metadata } })
    return NextResponse.json(res)
  } catch (e) {
    console.error('/api/points error:', e)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
