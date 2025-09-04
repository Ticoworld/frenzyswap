import { NextResponse } from 'next/server'
import { supabaseAdmin, isAdminEnabled } from '@/lib/supabaseAdmin'

export async function GET() {
  if (!isAdminEnabled() || !supabaseAdmin) return NextResponse.json({ ok: false, configured: false })
  try {
    // minimal ping by selecting 1 from a lightweight table likely to exist
    const { data, error } = await supabaseAdmin.from('user_settings').select('wallet_address').limit(1)
    if (error) {
      return NextResponse.json({ ok: false, configured: true, error: error.message })
    }
    return NextResponse.json({ ok: true, configured: true, sampleCount: data?.length ?? 0 })
  } catch (e: any) {
    return NextResponse.json({ ok: false, configured: true, error: e?.message || 'unknown' })
  }
}
