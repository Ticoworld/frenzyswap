import { NextRequest, NextResponse } from 'next/server'
import { supabase, isAnalyticsEnabled } from '@/lib/supabase'
import { getCache, setCache } from '@/lib/cache'

// GET /api/analytics-top?tf=24h|7d|30d|all&type=pairs|tokens|hours|biggest|projects
export async function GET(request: NextRequest) {
  try {
    if (!isAnalyticsEnabled()) return NextResponse.json({ data: [], status: 'analytics_not_configured' })
    const url = new URL(request.url)
    const tf = (url.searchParams.get('tf') || '7d').toLowerCase()
    const type = (url.searchParams.get('type') || 'pairs').toLowerCase()
    const limit = Math.min(parseInt(url.searchParams.get('limit') || '10', 10), 50)

  const cacheKey = `analytics-top:${type}:${tf}:${limit}`
  const cached = getCache<any>(cacheKey)
  if (cached) return NextResponse.json(cached)

    let since: Date | undefined
    if (tf === '24h') since = new Date(Date.now() - 24 * 60 * 60 * 1000)
    if (tf === '7d') since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    if (tf === '30d') since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)

    // Base select from swap_records
    let query = supabase!
      .from('swap_records')
      .select('from_token,to_token,from_usd_value,fees_usd_value,route_plan,created_at,wallet_address') as any
    if (since) query = query.gte('created_at', since.toISOString())
    const { data, error } = await query
    if (error) return NextResponse.json({ error: 'Failed to query' }, { status: 500 })
    let rows = data || []

    // Privacy: exclude opted-out and private profiles
    try {
      const [{ data: priv }, { data: opted }] = await Promise.all([
        supabase!.from('user_profiles').select('wallet_address, is_private').eq('is_private', true),
        supabase!.from('user_settings').select('wallet_address, analytics_opt_out').eq('analytics_opt_out', true),
      ])
      const hide = new Set<string>([
        ...((priv || []).map((p: any) => p.wallet_address) as string[]),
        ...((opted || []).map((p: any) => p.wallet_address) as string[]),
      ])
      if (hide.size) rows = rows.filter((r: any) => r.wallet_address && !hide.has(r.wallet_address))
    } catch {}

    // Helper: extract projects from route plan if available
    function extractMints(r: any): { inMint?: string; outMint?: string } {
      try {
        const plan = typeof r.route_plan === 'string' ? JSON.parse(r.route_plan) : r.route_plan
        if (Array.isArray(plan) && plan.length) {
          return { inMint: plan[0]?.swapInfo?.inputMint, outMint: plan[plan.length-1]?.swapInfo?.outputMint }
        }
      } catch {}
      return {}
    }

    if (type === 'pairs') {
      const m = new Map<string, { pair: string; volume: number; trades: number; fees: number; traders: Set<string> }>()
      for (const r of rows) {
        const key = `${r.from_token}->${r.to_token}`
        const e = m.get(key) || { pair: key, volume: 0, trades: 0, fees: 0, traders: new Set<string>() }
        e.volume += Number(r.from_usd_value) || 0
        e.trades += 1
        e.fees += Number((r as any).fees_usd_value) || 0
        if (r.wallet_address) e.traders.add(r.wallet_address)
        m.set(key, e)
      }
      const list = Array.from(m.values()).map(v => ({ pair: v.pair, volume: v.volume, trades: v.trades, fees: v.fees, traders: v.traders.size }))
        .sort((a,b)=>b.volume-a.volume).slice(0, limit)
      const payload = { type, tf, data: list }
      setCache(cacheKey, payload, 30_000)
      return NextResponse.json(payload)
    }

    if (type === 'tokens') {
      const m = new Map<string, { token: string; volume: number; trades: number; fees: number; traders: Set<string> }> ()
      for (const r of rows) {
        for (const t of [r.from_token, r.to_token]) {
          const e = m.get(t) || { token: t, volume: 0, trades: 0, fees: 0, traders: new Set<string>() }
          e.volume += Number(r.from_usd_value) || 0
          e.trades += 1
          e.fees += Number((r as any).fees_usd_value) || 0
          if (r.wallet_address) e.traders.add(r.wallet_address)
          m.set(t, e)
        }
      }
      const list = Array.from(m.values()).map(v => ({ token: v.token, volume: v.volume, trades: v.trades, fees: v.fees, traders: v.traders.size }))
        .sort((a,b)=>b.volume-a.volume).slice(0, limit)
      const payload = { type, tf, data: list }
      setCache(cacheKey, payload, 30_000)
      return NextResponse.json(payload)
    }

    if (type === 'hours') {
      const m = new Map<number, { hour: number; volume: number; trades: number; fees: number }>()
      for (const r of rows) {
        const h = new Date(r.created_at).getUTCHours()
        const e = m.get(h) || { hour: h, volume: 0, trades: 0, fees: 0 }
        e.volume += Number(r.from_usd_value) || 0
        e.trades += 1
        e.fees += Number((r as any).fees_usd_value) || 0
        m.set(h, e)
      }
      const list = Array.from(m.values()).sort((a,b)=>b.volume-a.volume)
      const payload = { type, tf, data: list }
      setCache(cacheKey, payload, 30_000)
      return NextResponse.json(payload)
    }

    if (type === 'biggest') {
      const list = rows
        .map((r: any) => ({ wallet: r.wallet_address, pair: `${r.from_token}->${r.to_token}` , volume: Number(r.from_usd_value)||0, fees: Number(r.fees_usd_value)||0, created_at: r.created_at }))
        .sort((a: any,b: any)=>b.volume-a.volume)
        .slice(0, limit)
      const payload = { type, tf, data: list }
      setCache(cacheKey, payload, 30_000)
      return NextResponse.json(payload)
    }

    if (type === 'projects') {
      const m = new Map<string, { project: string; volume: number; trades: number; fees: number; traders: Set<string> }>()
      for (const r of rows) {
        const { inMint, outMint } = extractMints(r)
        const set = new Set([inMint, outMint, r.from_token, r.to_token].filter(Boolean) as string[])
        for (const p of set) {
          const e = m.get(p) || { project: p, volume: 0, trades: 0, fees: 0, traders: new Set<string>() }
          e.volume += Number(r.from_usd_value) || 0
          e.trades += 1
          e.fees += Number((r as any).fees_usd_value) || 0
          if (r.wallet_address) e.traders.add(r.wallet_address)
          m.set(p, e)
        }
      }
      const list = Array.from(m.values()).map(v => ({ project: v.project, volume: v.volume, trades: v.trades, fees: v.fees, traders: v.traders.size }))
        .sort((a,b)=>b.volume-a.volume).slice(0, limit)
      const payload = { type, tf, data: list }
      setCache(cacheKey, payload, 30_000)
      return NextResponse.json(payload)
    }

    return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
  } catch (e) {
    console.error('analytics-top error', e)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
