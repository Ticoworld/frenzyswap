import { NextRequest, NextResponse } from 'next/server'
import { createInvite, consumeInviteIfValid, isWhitelistedEither } from '@/lib/access'
import { getAuthFromRequest } from '@/lib/auth'

// POST /api/invites -> create invite token (inviter must be whitelisted)
export async function POST(request: NextRequest) {
  // Prefer bearer/cookie auth; fallback to connected-wallet cookie/header
  const auth = getAuthFromRequest(request)
  let inviter = auth?.walletAddress
  if (!inviter) {
    inviter = request.headers.get('x-wallet') || request.cookies.get('connected-wallet')?.value || ''
  }
  if (!inviter) return NextResponse.json({ error: 'auth required' }, { status: 401 })
  if (!(await isWhitelistedEither(inviter))) return NextResponse.json({ error: 'not allowed' }, { status: 403 })
  const body = await request.json().catch(() => ({}))
  const maxUses = Math.min(Math.max(Number(body?.maxUses || 1), 1), 25)
  const expiresAt = body?.expiresAt ? new Date(body.expiresAt) : undefined
  const res = await createInvite(inviter, maxUses, expiresAt)
  if (!res.success) return NextResponse.json(res, { status: 400 })
  return NextResponse.json({ token: res.token })
}

// PUT /api/invites?token=... -> accept invite for wallet in body
export async function PUT(request: NextRequest) {
  const url = new URL(request.url)
  const token = url.searchParams.get('token') || ''
  const { wallet } = await request.json().catch(() => ({ wallet: '' }))
  if (!token || !wallet) return NextResponse.json({ error: 'token and wallet required' }, { status: 400 })
  const res = await consumeInviteIfValid(token, wallet)
  if (!res.success) return NextResponse.json(res, { status: 400 })
  return NextResponse.json({ success: true, inviter: res.inviter })
}
