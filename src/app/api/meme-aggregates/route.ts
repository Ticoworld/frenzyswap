import { NextRequest, NextResponse } from 'next/server'
import { supabase, isAnalyticsEnabled } from '@/lib/supabase'
import { getCache, setCache } from '@/lib/cache'

// GET /api/meme-aggregates?tf=24h|7d|30d|all
export async function GET(request: NextRequest) {
  try {
    if (!isAnalyticsEnabled()) return NextResponse.json({ data: { volumeUsd: 0, burns: 0, feesUsd: 0 } })
    const url = new URL(request.url)
    const tf = (url.searchParams.get('tf') || '7d').toLowerCase()
  const cacheKey = `meme-aggregates:${tf}`
  const cached = getCache<any>(cacheKey)
  if (cached) return NextResponse.json(cached)
    let since: Date | undefined
    if (tf === '24h') since = new Date(Date.now() - 24 * 60 * 60 * 1000)
    if (tf === '7d') since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    if (tf === '30d') since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)

    let query = supabase!.from('swap_records').select('from_usd_value, fees_usd_value, meme_burned, created_at, wallet_address') as any
    if (since) query = query.gte('created_at', since.toISOString())
    const { data, error } = await query
    if (error) return NextResponse.json({ error: 'Failed to query' }, { status: 500 })
    let rows = data || []
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
    const volumeUsd = rows.reduce((a: number, r: any) => a + (Number(r.from_usd_value)||0), 0)
    const feesUsd = rows.reduce((a: number, r: any) => a + (Number(r.fees_usd_value)||0), 0)
    const burns = rows.reduce((a: number, r: any) => a + (Number(r.meme_burned)||0), 0)
  const payload = { tf, data: { volumeUsd, feesUsd, burns } }
  setCache(cacheKey, payload, 30_000)
  return NextResponse.json(payload)
  } catch (e) {
    console.error('meme-aggregates error', e)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
