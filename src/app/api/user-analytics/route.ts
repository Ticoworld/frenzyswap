import { NextRequest, NextResponse } from 'next/server'
import { supabase, isAnalyticsEnabled } from '@/lib/supabase'
import { supabaseAdmin, isAdminEnabled } from '@/lib/supabaseAdmin'
import { requireAuth } from '@/lib/auth'

async function getWalletFromRequest(request: NextRequest): Promise<string | Response> {
  const auth = requireAuth(request)
  if (auth instanceof Response) {
    const w = request.headers.get('x-wallet') || new URL(request.url).searchParams.get('wallet')
    if (!w) return new Response(JSON.stringify({ error: 'Wallet not provided' }), { status: 401, headers: { 'Content-Type': 'application/json' } })
    return w
  }
  return auth.walletAddress
}

// GET /api/user-analytics?wallet=<wallet>
export async function GET(request: NextRequest) {
  try {
    if (!isAnalyticsEnabled() || !isAdminEnabled() || !supabase || !supabaseAdmin) {
      return NextResponse.json({ error: 'Server not configured' }, { status: 503 })
    }
    const walletOrResp = await getWalletFromRequest(request)
    if (walletOrResp instanceof Response) return walletOrResp
    const wallet = walletOrResp

    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()

    // Parallel queries
    const [swapsAll, swaps7d, points, streak, referralsAsRef, referralsAsRefe] = await Promise.all([
      supabase.from('swap_records').select('id, from_usd_value').eq('wallet_address', wallet),
      supabase.from('swap_records').select('id, from_usd_value').eq('wallet_address', wallet).gte('created_at', sevenDaysAgo),
      supabase.from('user_points_ledger').select('points').eq('wallet_address', wallet),
      supabase.from('user_streaks').select('current_streak_days,best_streak_days').eq('wallet_address', wallet).maybeSingle(),
      (supabaseAdmin || supabase)!.from('referrals').select('id,status').eq('referrer_wallet', wallet),
      (supabaseAdmin || supabase)!.from('referrals').select('id,status').eq('referee_wallet', wallet),
    ])

    const totalSwaps = swapsAll.data?.length || 0
    const totalVolumeUsd = (swapsAll.data || []).reduce((a: number, r: any) => a + (Number(r.from_usd_value) || 0), 0)
    const weekSwaps = swaps7d.data?.length || 0
    const weekVolumeUsd = (swaps7d.data || []).reduce((a: number, r: any) => a + (Number(r.from_usd_value) || 0), 0)
    const pointsTotal = (points.data || []).reduce((a: number, r: any) => a + (Number(r.points) || 0), 0)
    const currentStreak = Number(streak.data?.current_streak_days || 0)
    const bestStreak = Number(streak.data?.best_streak_days || 0)
    const refMade = referralsAsRef.data?.length || 0
    const refReceived = referralsAsRefe.data?.length || 0
    const refVerified = (referralsAsRef.data || []).filter((r: any) => r.status === 'verified').length

    return NextResponse.json({
      wallet,
      swaps: { total: totalSwaps, last7d: weekSwaps },
      volumeUsd: { total: totalVolumeUsd, last7d: weekVolumeUsd },
      points: pointsTotal,
      streaks: { current: currentStreak, best: bestStreak },
      referrals: { made: refMade, received: refReceived, verified: refVerified },
    })
  } catch (e) {
    console.error('user-analytics error', e)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
