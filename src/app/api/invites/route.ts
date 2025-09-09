import { NextRequest, NextResponse } from 'next/server'
import { isWhitelistedEither, hasAccessOrOnboard } from '@/lib/access'
import { getAuthFromRequest } from '@/lib/auth'

// Compatibility wrapper for legacy invite API.
// We no longer issue token-based invites; POST returns a referral link for the inviter.
export async function POST(request: NextRequest) {
  const auth = getAuthFromRequest(request)
  let inviter = auth?.walletAddress || request.headers.get('x-wallet') || request.cookies.get('connected-wallet')?.value || ''
  inviter = (inviter || '').toLowerCase()
  if (!inviter) return NextResponse.json({ error: 'auth required' }, { status: 401 })
  if (!(await isWhitelistedEither(inviter))) return NextResponse.json({ error: 'not allowed' }, { status: 403 })
  const origin = request.headers.get('origin') || new URL(request.url).origin
  const link = `${origin}/login?ref=${inviter}`
  return NextResponse.json({ link })
}

// Accept an invite by mapping token to referrer wallet for unified onboarding.
// PUT /api/invites?token=<referrerWallet> body: { wallet }
export async function PUT(request: NextRequest) {
  const url = new URL(request.url)
  const token = (url.searchParams.get('token') || '').toLowerCase()
  const { wallet } = await request.json().catch(() => ({ wallet: '' }))
  const w = (wallet || '').toLowerCase()
  if (!token || !w) return NextResponse.json({ error: 'token and wallet required' }, { status: 400 })
  const res = await hasAccessOrOnboard(w, token)
  if (!res.access) return NextResponse.json({ error: 'invalid or unauthorized', details: res }, { status: 400 })
  return NextResponse.json({ success: true, inviter: token })
}
