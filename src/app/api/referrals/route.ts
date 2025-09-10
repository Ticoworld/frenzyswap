import { NextRequest, NextResponse } from 'next/server'
import { createReferral } from '@/lib/referrals'
import { supabase, isAnalyticsEnabled } from '@/lib/supabase'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { getAuthFromRequest } from '@/lib/auth'

// POST /api/referrals { referrer, referee }
export async function POST(request: NextRequest) {
  if (!isAnalyticsEnabled()) return NextResponse.json({ error: 'Analytics not configured' }, { status: 503 })
  try {
    const payload = await request.json().catch(() => ({}))
    const referrer = String(payload?.referrer || '').toLowerCase()
    const referee = payload?.referee ? String(payload.referee).toLowerCase() : ''
    if (!referrer) return NextResponse.json({ error: 'referrer required' }, { status: 400 })
    // Auth consistency: if auth present, it must match referrer
    const auth = getAuthFromRequest(request)
    if (auth?.walletAddress && auth.walletAddress.toLowerCase() !== referrer) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // If no referee provided, return a clean referral link directly for UI convenience
    if (!referee) {
      const origin = request.headers.get('origin') || new URL(request.url).origin
      const link = `${origin}/login?ref=${referrer}`
      return NextResponse.json({ success: true, link, code: referrer })
    }

    // Otherwise, create a referral record (pending) for this pair
    const res = await createReferral(referrer, referee)
    if (!res.success) return NextResponse.json(res, { status: 400 })
    // Return a small, UI-friendly shape
    return NextResponse.json({ success: true, referral: { id: res.data?.id, referrer, referee, status: res.data?.status || 'pending' } })
  } catch (e) {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
  }
}

// GET /api/referrals?wallet=<wallet>&role=referrer|referee
export async function GET(request: NextRequest) {
  if (!isAnalyticsEnabled()) return NextResponse.json({ data: [] })
  const url = new URL(request.url)
  const wallet = (url.searchParams.get('wallet') || '').toLowerCase()
  const role = url.searchParams.get('role') || 'referrer'
  const col = role === 'referee' ? 'referred_wallet' : 'referrer_wallet'
  const client = (supabaseAdmin || supabase)!
  const { data, error } = await client.from('referrals').select('*').eq(col, wallet).order('created_at', { ascending: false })
  if (error) return NextResponse.json({ error: 'Failed' }, { status: 500 })
  return NextResponse.json({ data })
}
