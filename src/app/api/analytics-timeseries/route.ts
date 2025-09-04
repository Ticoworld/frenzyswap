import { NextRequest, NextResponse } from 'next/server'
import { supabase, isAnalyticsEnabled } from '@/lib/supabase'
import { getCache, setCache } from '@/lib/cache'

// GET /api/analytics-timeseries?days=30
export async function GET(request: NextRequest) {
  try {
    if (!isAnalyticsEnabled()) return NextResponse.json({ days: 0, data: [] })
  const url = new URL(request.url)
  const days = Math.min(parseInt(url.searchParams.get('days') || '30', 10), 90)
  const cacheKey = `analytics-timeseries:${days}`
  const cached = getCache<any>(cacheKey)
  if (cached) return NextResponse.json(cached)
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000)

    const { data, error } = await supabase!
      .from('swap_records')
      .select('wallet_address, from_usd_value, fees_usd_value, created_at')
      .gte('created_at', since.toISOString())
    if (error) return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 })
    const rows = data || []

    // Privacy: exclude opted-out and private
    try {
      const [{ data: priv }, { data: opted }] = await Promise.all([
        supabase!.from('user_profiles').select('wallet_address, is_private').eq('is_private', true),
        supabase!.from('user_settings').select('wallet_address, analytics_opt_out').eq('analytics_opt_out', true),
      ])
      const hide = new Set<string>([
        ...((priv || []).map((p: any) => p.wallet_address) as string[]),
        ...((opted || []).map((p: any) => p.wallet_address) as string[]),
      ])
      if (hide.size) {
        for (let i = rows.length - 1; i >= 0; i--) if (hide.has(rows[i].wallet_address)) rows.splice(i, 1)
      }
    } catch {}

    const byDay = new Map<string, { date: string; swaps: number; uniqueUsers: number; volumeUsd: number; feesUsd: number; users: Set<string> }>()
    for (const r of rows) {
      const d = new Date(r.created_at)
      const key = d.toISOString().slice(0,10)
      const entry = byDay.get(key) || { date: key, swaps: 0, uniqueUsers: 0, volumeUsd: 0, feesUsd: 0, users: new Set<string>() }
      entry.swaps += 1
      entry.volumeUsd += Number(r.from_usd_value) || 0
      entry.feesUsd += Number(r.fees_usd_value) || 0
      if (r.wallet_address) entry.users.add(r.wallet_address)
      byDay.set(key, entry)
    }
    const list = Array.from(byDay.values()).map(e => ({ date: e.date, swaps: e.swaps, uniqueUsers: e.users.size, volumeUsd: e.volumeUsd, feesUsd: e.feesUsd }))
      .sort((a,b)=>a.date.localeCompare(b.date))
  const payload = { days, data: list }
  setCache(cacheKey, payload, 30_000)
  return NextResponse.json(payload)
  } catch (e) {
    console.error('analytics-timeseries error', e)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
