import { NextRequest } from 'next/server'
import { supabaseAdmin, isAdminEnabled } from '@/lib/supabaseAdmin'
import { requireAdmin } from '@/lib/auth'

export async function POST(request: NextRequest) {
  if (!isAdminEnabled() || !supabaseAdmin) return new Response(JSON.stringify({ error: 'Server not configured' }), { status: 500, headers: { 'Content-Type': 'application/json' } })
  const admin = requireAdmin(request)
  if (admin instanceof Response) return admin
  let body: any
  try { body = await request.json() } catch { return new Response(JSON.stringify({ error: 'Invalid JSON' }), { status: 400, headers: { 'Content-Type': 'application/json' } }) }
  const { wallet, title, body: text } = body || {}
  // For now, only log delivery intent; wire actual web-push later with VAPID keys
  await supabaseAdmin.from('notification_deliveries').insert([{ wallet_address: wallet, channel: 'in-app', status: 'queued', title, body: text }])
  return new Response(JSON.stringify({ status: 'queued' }), { status: 200, headers: { 'Content-Type': 'application/json' } })
}
