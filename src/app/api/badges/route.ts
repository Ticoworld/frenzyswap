import { NextRequest, NextResponse } from 'next/server'
import { supabase, isAnalyticsEnabled } from '@/lib/supabase'

// GET /api/badges?wallet=...
export async function GET(request: NextRequest) {
  if (!isAnalyticsEnabled()) return NextResponse.json({ catalog: [], user: [] })
  const url = new URL(request.url)
  const wallet = url.searchParams.get('wallet') || ''
  const [{ data: catalog }, { data: user }] = await Promise.all([
    supabase!.from('badges_catalog').select('*'),
    wallet ? supabase!.from('user_badges').select('*').eq('wallet_address', wallet) : Promise.resolve({ data: [] as any })
  ])
  return NextResponse.json({ catalog: catalog || [], user: user || [] })
}
