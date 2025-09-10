import { NextRequest, NextResponse } from 'next/server'
import { supabase, isAnalyticsEnabled } from '@/lib/supabase'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

// GET /api/users?scope=all|invited|active|waitlisted&limit=100&offset=0
// Response: { data: Array<{ wallet, joinType, status, createdAt, lastActive }>, total }
export async function GET(request: NextRequest) {
  if (!isAnalyticsEnabled()) return NextResponse.json({ data: [] })
  const url = new URL(request.url)
  const scope = (url.searchParams.get('scope') || 'all').toLowerCase()
  const limit = Math.min(Number(url.searchParams.get('limit') || 100), 500)
  const offset = Math.max(Number(url.searchParams.get('offset') || 0), 0)
  const client = (supabaseAdmin || supabase)!

  try {
    // Base set: union of wallets seen across whitelist, referrals, sessions, and swaps
    // Select minimal columns for timestamps aggregation
    const [wlRes, refsRes, sessionsRes, swapsRes] = await Promise.all([
      client.from('access_whitelist').select('wallet_address, added_at'),
      client.from('referrals').select('referrer_wallet, referred_wallet, created_at'),
      client.from('user_sessions').select('wallet_address, first_visit, last_activity'),
      client.from('swap_records').select('wallet_address, created_at'),
    ])
    const wl = wlRes.data || []
    const refs = refsRes.data || []
    const sessions = sessionsRes.data || []
    const swaps = swapsRes.data || []

    const set = new Set<string>()
    wl.forEach((r:any)=>set.add(r.wallet_address))
    refs.forEach((r:any)=>{ if(r.referrer_wallet) set.add(r.referrer_wallet); if(r.referred_wallet) set.add(r.referred_wallet) })
    sessions.forEach((r:any)=>{ if(r.wallet_address) set.add(r.wallet_address) })
    swaps.forEach((r:any)=>{ if(r.wallet_address) set.add(r.wallet_address) })
    const allWallets = Array.from(set)

    // Join-type and activity classification
    const invited = new Set<string>(refs.map((r:any)=>r.referred_wallet).filter(Boolean))
    const active = new Set<string>(swaps.map((r:any)=>r.wallet_address).filter(Boolean))

    // Timestamp aggregation helpers
    const earliest = (a?: string|null, b?: string|null) => {
      if (!a) return b || null
      if (!b) return a || null
      return new Date(a) <= new Date(b) ? a : b
    }
    const latest = (a?: string|null, b?: string|null) => {
      if (!a) return b || null
      if (!b) return a || null
      return new Date(a) >= new Date(b) ? a : b
    }

    // Pre-index for faster lookups
    const wlMap = new Map<string,string>()
    wl.forEach((r:any)=>wlMap.set(r.wallet_address, r.added_at))
    const sessionByWallet = sessions.reduce((m:any,r:any)=>{
      const cur = m.get(r.wallet_address) || { first_visit: null as string|null, last_activity: null as string|null }
      cur.first_visit = earliest(cur.first_visit, r.first_visit)
      cur.last_activity = latest(cur.last_activity, r.last_activity)
      m.set(r.wallet_address, cur); return m
    }, new Map<string, any>())
    const swapByWallet = swaps.reduce((m:any,r:any)=>{
      const cur = m.get(r.wallet_address) || { first_swap: null as string|null, last_swap: null as string|null }
      cur.first_swap = earliest(cur.first_swap, r.created_at)
      cur.last_swap = latest(cur.last_swap, r.created_at)
      m.set(r.wallet_address, cur); return m
    }, new Map<string, any>())
    const refByWallet = refs.reduce((m:any,r:any)=>{
      // track first time a wallet appeared as referred
      if (r.referred_wallet) {
        const cur = m.get(r.referred_wallet) || { first_referred: null as string|null }
        cur.first_referred = earliest(cur.first_referred, r.created_at)
        m.set(r.referred_wallet, cur)
      }
      return m
    }, new Map<string, any>())

    let list = allWallets.map(w=>({
      wallet: w,
      joinType: invited.has(w) ? 'referral' : 'direct',
      status: active.has(w) ? 'active' : 'inactive',
      createdAt: earliest(
        wlMap.get(w) || null,
        earliest(
          sessionByWallet.get(w)?.first_visit || null,
          earliest(refByWallet.get(w)?.first_referred || null, swapByWallet.get(w)?.first_swap || null)
        )
      ),
      lastActive: latest(
        sessionByWallet.get(w)?.last_activity || null,
        swapByWallet.get(w)?.last_swap || null
      )
    }))

    if (scope === 'invited') list = list.filter(u=>u.joinType==='referral')
    if (scope === 'active') list = list.filter(u=>u.status==='active')
    if (scope === 'waitlisted') {
      const wlSet = new Set<string>(wl.map((r:any)=>r.wallet_address))
      list = list.filter(u=>!wlSet.has(u.wallet))
    }

    const total = list.length
    const data = list.slice(offset, offset+limit)
    return NextResponse.json({ data, total })
  } catch (e) {
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 })
  }
}
