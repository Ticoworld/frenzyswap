import { NextRequest, NextResponse } from 'next/server'
import { hasAccessOrOnboard } from '@/lib/access'

export async function GET(request: NextRequest) {
  const url = new URL(request.url)
  const wallet = (url.searchParams.get('wallet') || '').toLowerCase()
  // Accept both ?ref= and legacy ?invite= for compatibility, but treat both as ref
  const ref = url.searchParams.get('ref') || url.searchParams.get('invite') || undefined
  if (!wallet) return NextResponse.json({ error: 'wallet required' }, { status: 400 })
  const res = await hasAccessOrOnboard(wallet, ref)
  const resp = NextResponse.json(res)
  if (res.access) {
    resp.cookies.set('access-ok', '1', { path: '/', maxAge: 60 * 60 * 24 })
  }
  return resp
}
