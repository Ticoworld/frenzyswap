import { NextRequest, NextResponse } from 'next/server'
import { createReferral } from '@/lib/referrals'
import { supabase, isAnalyticsEnabled } from '@/lib/supabase'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { getAuthFromRequest } from '@/lib/auth'

// POST /api/referrals { referrer, referee }
export async function POST(request: NextRequest) {
  if (!isAnalyticsEnabled()) return NextResponse.json({ error: 'Analytics not configured' }, { status: 503 })
  try {
    const { referrer, referee } = await request.json()
    const auth = getAuthFromRequest(request)
    if (auth && auth.walletAddress && auth.walletAddress !== String(referrer).toLowerCase()) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    const res = await createReferral(referrer, referee)
    if (!res.success) return NextResponse.json(res, { status: 400 })
    return NextResponse.json(res)
  } catch (e) {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
  }
}

// GET /api/referrals?wallet=<wallet>&role=referrer|referee
export async function GET(request: NextRequest) {
  if (!isAnalyticsEnabled()) return NextResponse.json({ data: [] })
  const url = new URL(request.url)
  const wallet = url.searchParams.get('wallet') || ''
  const role = url.searchParams.get('role') || 'referrer'
  const col = role === 'referee' ? 'referee_wallet' : 'referrer_wallet'
  const client = (supabaseAdmin || supabase)!
  const { data, error } = await client.from('referrals').select('*').eq(col, wallet).order('created_at', { ascending: false })
  if (error) return NextResponse.json({ error: 'Failed' }, { status: 500 })
  return NextResponse.json({ data })
}
