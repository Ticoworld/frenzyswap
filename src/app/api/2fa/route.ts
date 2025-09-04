import { NextRequest, NextResponse } from 'next/server'
import { authenticator } from 'otplib'
import QRCode from 'qrcode'
import { supabaseAdmin, isAdminEnabled } from '@/lib/supabaseAdmin'
import { requireAuth } from '@/lib/auth'

const ISSUER = process.env.NEXT_PUBLIC_APP_NAME || 'FrenzySwap'

function randomCodes(n = 8) {
  const codes: string[] = []
  for (let i=0;i<n;i++) codes.push(Math.random().toString(36).slice(2,10))
  return codes
}

export async function GET(request: NextRequest) {
  if (!isAdminEnabled() || !supabaseAdmin) return NextResponse.json({ enabled: false })
  const auth = requireAuth(request)
  const wallet = auth instanceof Response ? request.headers.get('x-wallet') || '' : auth.walletAddress
  if (!wallet) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  const { data } = await supabaseAdmin.from('user_security').select('totp_enabled').eq('wallet_address', wallet).maybeSingle()
  return NextResponse.json({ enabled: !!data?.totp_enabled })
}

export async function POST(request: NextRequest) {
  if (!isAdminEnabled() || !supabaseAdmin) return NextResponse.json({ error: 'Server not configured' }, { status: 500 })
  const auth = requireAuth(request)
  const wallet = auth instanceof Response ? request.headers.get('x-wallet') || '' : auth.walletAddress
  if (!wallet) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  const action = new URL(request.url).searchParams.get('action') || 'start'
  if (action === 'start') {
    const secret = authenticator.generateSecret()
    const otpURI = authenticator.keyuri(wallet, ISSUER, secret)
    const qr = await QRCode.toDataURL(otpURI)
    await supabaseAdmin.from('user_security').upsert({ wallet_address: wallet, totp_secret: secret, totp_enabled: false, updated_at: new Date().toISOString() }, { onConflict: 'wallet_address' })
    return NextResponse.json({ qr, secret })
  }
  if (action === 'verify') {
    const { token } = await request.json()
    const { data, error } = await supabaseAdmin.from('user_security').select('totp_secret').eq('wallet_address', wallet).maybeSingle()
    if (error || !data?.totp_secret) return NextResponse.json({ error: 'not_initialized' }, { status: 400 })
    const ok = authenticator.verify({ token, secret: data.totp_secret })
    if (!ok) return NextResponse.json({ error: 'invalid_token' }, { status: 400 })
    const rec = randomCodes()
    await supabaseAdmin.from('user_security').update({ totp_enabled: true, recovery_codes: rec, updated_at: new Date().toISOString() }).eq('wallet_address', wallet)
    return NextResponse.json({ enabled: true, recovery: rec })
  }
  if (action === 'disable') {
    await supabaseAdmin.from('user_security').update({ totp_enabled: false, totp_secret: null, recovery_codes: [], updated_at: new Date().toISOString() }).eq('wallet_address', wallet)
    return NextResponse.json({ enabled: false })
  }
  return NextResponse.json({ error: 'invalid_action' }, { status: 400 })
}
