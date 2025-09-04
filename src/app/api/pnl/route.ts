import { NextRequest, NextResponse } from 'next/server'
import { getUserPnl, upsertUserPnlCache } from '@/lib/pnl'
import { supabaseAdmin, isAdminEnabled } from '@/lib/supabaseAdmin'
import { getAuthFromRequest } from '@/lib/auth'

// GET /api/pnl?wallet=...
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const wallet = (url.searchParams.get('wallet') || '').trim()
    if (!wallet) {
      return NextResponse.json({ error: 'wallet is required' }, { status: 400 })
    }
    // Owner-only read: if requester is not the owner or admin, block
    const auth = getAuthFromRequest(request)
    const requester = auth?.walletAddress
    const isAdmin = !!auth?.isAdmin
    if (requester && requester !== wallet && !isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    // Enforce privacy for non-owners based on user_settings
    let summary = await getUserPnl(wallet)
    if (requester !== wallet && !isAdmin) {
      try {
        if (isAdminEnabled() && supabaseAdmin) {
          const { data } = await supabaseAdmin.from('user_settings').select('hide_pnl, hide_volume').eq('wallet_address', wallet).maybeSingle();
          if (data) {
            if (data.hide_pnl) summary.realizedPnlUsd = 0;
            if (data.hide_volume) summary.totalVolumeUsd = 0;
          }
        }
      } catch {}
    }
    // best-effort cache write
  upsertUserPnlCache(wallet, summary).catch(() => {})
    return NextResponse.json(summary)
  } catch (e) {
    console.error('/api/pnl error:', e)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
