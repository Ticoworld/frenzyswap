import { supabase, isAnalyticsEnabled } from './supabase'
import { supabaseAdmin } from './supabaseAdmin'

export type PointsReason =
  | 'swap'
  | 'referral_verified'
  | 'referral_accepted'
  | 'streak_day'
  | 'special_event'

interface AwardPointsInput {
  wallet: string
  points: number
  reason: PointsReason
  metadata?: Record<string, any>
  signature?: string
}

// Simple points policy v1
export const PointsPolicy = {
  swapBase: 5, // base points per swap
  volumePerUsd: 0.05, // points per 1 USD volume
  referralVerified: 200,
  referralAccepted: 50,
  streakDaily: 10,
}

export async function awardPoints(input: AwardPointsInput) {
  if (!isAnalyticsEnabled()) return { success: false, skipped: true }
  try {
    // Fraud/velocity cap: max 10 point awards per wallet per 1 minute
    const client = (supabaseAdmin || supabase)!
    const oneMinAgo = new Date(Date.now() - 60_000).toISOString()
    const { count } = await client
      .from('user_points_ledger')
      .select('*', { count: 'exact', head: true })
      .eq('wallet_address', input.wallet)
      .gte('created_at', oneMinAgo)
    if ((count || 0) > 10) {
      await client.from('event_logs').insert([{ event_type: 'fraud_velocity_cap', wallet_address: input.wallet, metadata: { reason: 'points_rate_limit', count } }])
      return { success: false, error: 'Rate limited' }
    }

    // Blacklist check
    try {
      const { data: bl } = await client.from('blacklisted_wallets').select('wallet_address').eq('wallet_address', input.wallet).limit(1)
      if (bl && bl.length) {
        await client.from('event_logs').insert([{ event_type: 'fraud_blacklisted_block', wallet_address: input.wallet, metadata: { reason: 'blacklisted' } }])
        return { success: false, error: 'Blacklisted' }
      }
    } catch {}

    const { data, error } = await client
      .from('user_points_ledger')
      .insert([{ 
        wallet_address: input.wallet,
        points: Math.round(input.points),
        reason: input.reason,
        metadata: input.metadata || null,
        signature: input.signature || null,
      }])
      .select()

    if (error) throw error
    return { success: true, data: data?.[0] }
  } catch (e) {
    console.error('[Gamification] awardPoints failed:', e)
    return { success: false, error: String(e) }
  }
}

export async function upsertStreak(wallet: string, swapTime: Date) {
  if (!isAnalyticsEnabled()) return { success: false, skipped: true }
  try {
    const today = new Date(swapTime)
    const todayDate = today.toISOString().slice(0, 10)

  const client = (supabaseAdmin || supabase)!
  const { data: existing } = await client
      .from('user_streaks')
      .select('*')
      .eq('wallet_address', wallet)
      .single()

    let current = 1
    let best = 1
    if (existing) {
      const last = existing.last_swap_date
        ? new Date(existing.last_swap_date)
        : null
      if (last) {
        const diffDays = Math.floor(
          (new Date(todayDate).getTime() -
            new Date(last.toISOString().slice(0, 10)).getTime()) /
            (1000 * 60 * 60 * 24)
        )
        if (diffDays === 0) {
          // same day, keep counts
          current = existing.current_streak_days || 1
          best = existing.best_streak_days || current
        } else if (diffDays === 1) {
          current = (existing.current_streak_days || 0) + 1
          best = Math.max(existing.best_streak_days || 0, current)
        } else {
          current = 1
          best = Math.max(existing.best_streak_days || 1, 1)
        }
      }
    }

  const { error } = await client
      .from('user_streaks')
      .upsert({
        wallet_address: wallet,
        current_streak_days: current,
        best_streak_days: best,
        last_swap_date: todayDate,
        updated_at: new Date().toISOString(),
      })
    if (error) throw error

    // award daily streak points (only if new day or first time)
    if (!existing || (existing && existing.last_swap_date !== todayDate)) {
      await awardPoints({ wallet, points: PointsPolicy.streakDaily, reason: 'streak_day', metadata: { day: todayDate } })
    }
    return { success: true, data: { current, best } }
  } catch (e) {
    console.error('[Gamification] upsertStreak failed:', e)
    return { success: false, error: String(e) }
  }
}

export async function logEvent(event: {
  event_type: string
  wallet_address?: string
  ref_wallet_address?: string
  signature?: string
  tx_hash?: string
  metadata?: Record<string, any>
}) {
  if (!isAnalyticsEnabled()) return { success: false, skipped: true }
  try {
    const client = (supabaseAdmin || supabase)!
    const { data, error } = await client
      .from('event_logs')
      .insert([{ ...event }])
      .select()
    if (error) throw error
    return { success: true, data: data?.[0] }
  } catch (e) {
    console.error('[Gamification] logEvent failed:', e)
    return { success: false, error: String(e) }
  }
}

export async function getLeaderboard(
  kind: 'points' | 'volume' | 'streak' = 'points',
  limit = 50,
  opts?: { live?: boolean; timeframeSince?: Date }
) {
  if (!isAnalyticsEnabled()) return []
  if (kind === 'points') {
    if (!opts?.live && !opts?.timeframeSince) {
      // Prefer materialized view for efficiency when not time-bound
      const { data: mv, error } = await supabase!
        .from('mv_leaderboard_points' as any)
        .select('wallet_address, total_points')
        .order('total_points', { ascending: false })
        .limit(limit)
      if (!error && mv) {
        // filter private profiles
        const { data: priv } = await supabase!
          .from('user_profiles')
          .select('wallet_address, is_private')
          .in('wallet_address', (mv as any[]).map((r: any) => r.wallet_address))
        const hide = new Set((priv || []).filter((p: any) => p.is_private).map((p: any) => p.wallet_address))
        return (mv as any[])
          .filter((r: any) => !hide.has(r.wallet_address))
          .map((r: any) => ({ wallet: r.wallet_address, value: Number(r.total_points || 0) }))
      }
    }
    // Live/fallback aggregation if MV missing, live requested, or timeframe requested
    const client = (supabaseAdmin || supabase)!
    let query = client
      .from('user_points_ledger')
      .select('wallet_address, points, created_at') as any
    if (opts?.timeframeSince) query = query.gte('created_at', opts.timeframeSince.toISOString())
    const { data } = await query
    const map = new Map<string, number>()
    for (const row of data || []) map.set(row.wallet_address, (map.get(row.wallet_address) || 0) + (row.points || 0))
    // filter private
    const wallets = Array.from(map.keys())
    const { data: priv } = await supabase!.from('user_profiles').select('wallet_address, is_private').in('wallet_address', wallets)
    const hide = new Set((priv || []).filter((p: any) => p.is_private).map((p: any) => p.wallet_address))
    return Array.from(map.entries())
      .filter(([w]) => !hide.has(w))
      .map(([wallet, points]) => ({ wallet, value: points }))
      .sort((a, b) => b.value - a.value)
      .slice(0, limit)
  }
  if (kind === 'streak') {
    const { data } = await supabase!
      .from('user_streaks')
      .select('wallet_address, best_streak_days')
      .order('best_streak_days', { ascending: false })
      .limit(limit)
    const wallets = (data || []).map(d => d.wallet_address)
    const { data: priv } = await supabase!.from('user_profiles').select('wallet_address, is_private').in('wallet_address', wallets)
    const hide = new Set((priv || []).filter((p: any) => p.is_private).map((p: any) => p.wallet_address))
    return (data || [])
      .filter(d => !hide.has(d.wallet_address))
      .map(d => ({ wallet: d.wallet_address, value: d.best_streak_days }))
  }
  // volume from swap_records
  let volQuery = supabase!
    .from('swap_records')
    .select('wallet_address, from_usd_value, created_at') as any
  if (opts?.timeframeSince) volQuery = volQuery.gte('created_at', opts.timeframeSince.toISOString())
  const { data } = await volQuery
  const m = new Map<string, number>()
  for (const r of data || []) {
    m.set(r.wallet_address, (m.get(r.wallet_address) || 0) + (Number(r.from_usd_value) || 0))
  }
  const wallets = Array.from(m.keys())
  const { data: priv } = await supabase!.from('user_profiles').select('wallet_address, is_private').in('wallet_address', wallets)
  const hide = new Set((priv || []).filter((p: any) => p.is_private).map((p: any) => p.wallet_address))
  return Array.from(m.entries())
    .filter(([w]) => !hide.has(w))
    .map(([wallet, value]) => ({ wallet, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, limit)
}
