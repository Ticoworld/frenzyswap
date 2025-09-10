import { NextRequest, NextResponse } from 'next/server'
import { supabase, isAnalyticsEnabled } from '@/lib/supabase'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

// GET /api/analytics?period=daily|weekly|monthly|yearly
// Response: { data: { since, totalUsers, invitedUsers, activeUsers, farmedInvites, totalReferrals, totalSwaps, totalSessions, totalPointsEvents } }
export async function GET(request: NextRequest) {
  if (!isAnalyticsEnabled()) return NextResponse.json({ data: {}, series: { resolution: null, buckets: [] } })
  const url = new URL(request.url)
  const period = (url.searchParams.get('period') || 'daily').toLowerCase()
  const client = (supabaseAdmin || supabase)!

  // Helper: floor to period
  const now = new Date()
  const since = new Date(now)
  if (period === 'weekly') since.setDate(now.getDate()-7)
  else if (period === 'monthly') since.setMonth(now.getMonth()-1)
  else if (period === 'yearly') since.setFullYear(now.getFullYear()-1)
  else since.setDate(now.getDate()-1)
  const sinceIso = since.toISOString()

  // Derive series resolution and bucket generator
  type Resolution = 'hour'|'day'|'month'
  let resolution: Resolution = 'day'
  if (period === 'daily') resolution = 'hour'
  else if (period === 'weekly' || period === 'monthly') resolution = 'day'
  else resolution = 'month'

  const floorToBucket = (d: Date): string => {
    const dd = new Date(d)
    if (resolution === 'hour') {
      dd.setMinutes(0,0,0)
    } else if (resolution === 'day') {
      dd.setHours(0,0,0,0)
    } else { // month
      dd.setDate(1); dd.setHours(0,0,0,0)
    }
    return dd.toISOString()
  }

  const generateBuckets = (): string[] => {
    const buckets: string[] = []
    const now = new Date()
    const cur = new Date(since)
    while (cur <= now) {
      buckets.push(floorToBucket(cur))
      if (resolution === 'hour') cur.setHours(cur.getHours()+1)
      else if (resolution === 'day') cur.setDate(cur.getDate()+1)
      else cur.setMonth(cur.getMonth()+1)
    }
    return buckets
  }

  try {
    const [referrals, swaps, sessions, points] = await Promise.all([
      client.from('referrals').select('*').gte('created_at', sinceIso),
      client.from('swap_records').select('*').gte('created_at', sinceIso),
      client.from('user_sessions').select('*').gte('first_visit', sinceIso),
      client.from('user_points_ledger').select('*').gte('created_at', sinceIso),
    ])

    const totalUsersSet = new Set<string>()
    ;(sessions.data||[]).forEach((r:any)=>r.wallet_address && totalUsersSet.add(r.wallet_address))
    ;(swaps.data||[]).forEach((r:any)=>r.wallet_address && totalUsersSet.add(r.wallet_address))

    const invitedSet = new Set<string>((referrals.data||[]).map((r:any)=>r.referred_wallet))
    const activeSet = new Set<string>((swaps.data||[]).map((r:any)=>r.wallet_address))

    // Aggregates over selected period
    const totalVolumeUsd = (swaps.data||[]).reduce((sum:number, r:any)=> sum + (parseFloat(r.from_usd_value || '0') || 0), 0)
    const platformEarningsUsd = (swaps.data||[]).reduce((sum:number, r:any)=> sum + (parseFloat(r.fees_usd_value || '0') || 0), 0)
    const totalMemeBurned = (swaps.data||[]).reduce((sum:number, r:any)=> sum + (parseFloat(r.meme_burned || '0') || 0), 0)
    const uniqueWalletsCount = new Set<string>((swaps.data||[]).map((r:any)=> r.wallet_address).filter(Boolean)).size

    const stats = {
      since: sinceIso,
      totalUsers: totalUsersSet.size,
      invitedUsers: invitedSet.size,
      activeUsers: activeSet.size,
      farmedInvites: Array.from(invitedSet).filter(w=>!activeSet.has(w)).length,
      totalReferrals: (referrals.data||[]).length,
      totalSwaps: (swaps.data||[]).length,
      totalSessions: (sessions.data||[]).length,
      totalPointsEvents: (points.data||[]).length,
      totalVolumeUsd,
      platformEarningsUsd,
      totalMemeBurned,
      uniqueWalletsCount,
    }

    // Build time series buckets
    const bucketKeys = generateBuckets()
    type Bucket = { ts: string, swaps: number, sessions: number, users: number, referrals: number }
    const bucketsMap = new Map<string, Bucket>()
    bucketKeys.forEach(ts => bucketsMap.set(ts, { ts, swaps: 0, sessions: 0, users: 0, referrals: 0 }))

    // Swap counts by created_at
    ;(swaps.data||[]).forEach((r:any)=>{
      const ts = floorToBucket(new Date(r.created_at))
      const b = bucketsMap.get(ts); if (b) b.swaps++
    })
    // Session counts by first_visit; unique users per bucket (by wallet_address)
    const usersByBucket = new Map<string, Set<string>>()
    ;(sessions.data||[]).forEach((r:any)=>{
      const ts = floorToBucket(new Date(r.first_visit))
      const b = bucketsMap.get(ts); if (b) b.sessions++
      if (!usersByBucket.has(ts)) usersByBucket.set(ts, new Set<string>())
      if (r.wallet_address) usersByBucket.get(ts)!.add(r.wallet_address)
    })
    usersByBucket.forEach((set, ts) => {
      const b = bucketsMap.get(ts); if (b) b.users = set.size
    })
    // Referrals by created_at
    ;(referrals.data||[]).forEach((r:any)=>{
      const ts = floorToBucket(new Date(r.created_at))
      const b = bucketsMap.get(ts); if (b) b.referrals++
    })

    const series = { resolution, buckets: Array.from(bucketsMap.values()).sort((a,b)=> new Date(a.ts).getTime() - new Date(b.ts).getTime()) }

    return NextResponse.json({ data: stats, series })
  } catch (e) {
    return NextResponse.json({ error: 'Failed to compute analytics' }, { status: 500 })
  }
}
