import { NextRequest } from 'next/server'
import webpush from 'web-push'
import { supabaseAdmin, isAdminEnabled } from '@/lib/supabaseAdmin'
import { requireAdmin } from '@/lib/auth'

function ensureVapidConfigured() {
  const publicKey = process.env.WEB_PUSH_PUBLIC_KEY
  const privateKey = process.env.WEB_PUSH_PRIVATE_KEY
  const email = process.env.WEB_PUSH_CONTACT || 'mailto:admin@example.com'
  if (!publicKey || !privateKey) return false
  try { webpush.setVapidDetails(email, publicKey, privateKey) } catch {}
  return true
}

export async function POST(request: NextRequest) {
  if (!isAdminEnabled() || !supabaseAdmin) return new Response(JSON.stringify({ error: 'Server not configured' }), { status: 500, headers: { 'Content-Type': 'application/json' } })
  const auth = requireAdmin(request)
  if (auth instanceof Response) return auth
  const ok = ensureVapidConfigured()
  if (!ok) return new Response(JSON.stringify({ error: 'VAPID keys not configured' }), { status: 500, headers: { 'Content-Type': 'application/json' } })

  let body: any
  try { body = await request.json() } catch { return new Response(JSON.stringify({ error: 'Invalid JSON' }), { status: 400, headers: { 'Content-Type': 'application/json' } }) }
  const { wallet, title, body: text, data } = body || {}
  if (!wallet || !title || !text) return new Response(JSON.stringify({ error: 'wallet, title, body required' }), { status: 400, headers: { 'Content-Type': 'application/json' } })

  const { data: subs, error } = await supabaseAdmin.from('notification_subscriptions').select('*').eq('wallet_address', wallet)
  if (error) return new Response(JSON.stringify({ error: error.message }), { status: 400, headers: { 'Content-Type': 'application/json' } })

  let sent = 0, failed = 0
  for (const s of subs || []) {
    try {
      await webpush.sendNotification({ endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } }, JSON.stringify({ title, body: text, data }))
      sent++
      await supabaseAdmin.from('notification_deliveries').insert([{ wallet_address: wallet, channel: 'web-push', status: 'sent', title, body: text }])
    } catch (e: any) {
      failed++
      await supabaseAdmin.from('notification_deliveries').insert([{ wallet_address: wallet, channel: 'web-push', status: 'failed', title, body: text, error: String(e?.message || e) }])
    }
  }
  return new Response(JSON.stringify({ sent, failed }), { status: 200, headers: { 'Content-Type': 'application/json' } })
}
