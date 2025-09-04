import { NextRequest } from 'next/server'
import webpush from 'web-push'
import { supabaseAdmin, isAdminEnabled } from '@/lib/supabaseAdmin'
import { requireAuth } from '@/lib/auth'

export async function POST(request: NextRequest) {
  // Graceful degrade if backend admin client is not available (local dev or disabled)
  if (!isAdminEnabled() || !supabaseAdmin) {
    return new Response(
      JSON.stringify({ ok: false, supported: false, skipped: true, reason: 'admin_disabled' }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    )
  }
  const auth = requireAuth(request)
  const wallet = auth instanceof Response ? request.headers.get('x-wallet') || '' : auth.walletAddress
  if (!wallet) return new Response(JSON.stringify({ error: 'Wallet not provided' }), { status: 401, headers: { 'Content-Type': 'application/json' } })
  let body: any
  try { body = await request.json() } catch { return new Response(JSON.stringify({ error: 'Invalid JSON' }), { status: 400, headers: { 'Content-Type': 'application/json' } }) }
  const { endpoint, keys } = body || {}
  if (!endpoint || !keys?.p256dh || !keys?.auth) return new Response(JSON.stringify({ error: 'Invalid subscription' }), { status: 400, headers: { 'Content-Type': 'application/json' } })
  const payload = { endpoint, wallet_address: wallet, p256dh: keys.p256dh, auth: keys.auth }
  const { error } = await supabaseAdmin.from('notification_subscriptions').upsert(payload, { onConflict: 'endpoint' })
  if (error) return new Response(JSON.stringify({ error: error.message }), { status: 400, headers: { 'Content-Type': 'application/json' } })
  return new Response(JSON.stringify({ status: 'ok' }), { status: 200, headers: { 'Content-Type': 'application/json' } })
}
