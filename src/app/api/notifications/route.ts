import { NextRequest } from 'next/server';
import { supabaseAdmin, isAdminEnabled } from '@/lib/supabaseAdmin';
import { requireAuth } from '@/lib/auth';

async function getWalletFromRequest(request: NextRequest): Promise<string | Response> {
  const auth = requireAuth(request);
  if (auth instanceof Response) {
    const w = request.headers.get('x-wallet');
    if (!w) return new Response(JSON.stringify({ error: 'Wallet not provided' }), { status: 401, headers: { 'Content-Type': 'application/json' } });
    return w;
  }
  return auth.walletAddress;
}

export async function GET(request: NextRequest) {
  if (!isAdminEnabled() || !supabaseAdmin) return new Response(JSON.stringify({ supported: false, message: 'Server not configured' }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  const walletOrResp = await getWalletFromRequest(request);
  if (walletOrResp instanceof Response) return walletOrResp;
  const wallet = walletOrResp;
  const { data } = await supabaseAdmin
    .from('user_settings')
    .select('notif_transactions, notif_referrals, notif_badges, notif_security')
    .eq('wallet_address', wallet)
    .maybeSingle();
  return new Response(JSON.stringify({ supported: true, data: data || { notif_transactions: false, notif_referrals: false, notif_badges: false, notif_security: true } }), { status: 200, headers: { 'Content-Type': 'application/json' } });
}

export async function PATCH(request: NextRequest) {
  if (!isAdminEnabled() || !supabaseAdmin) return new Response(JSON.stringify({ error: 'Server not configured' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  const walletOrResp = await getWalletFromRequest(request);
  if (walletOrResp instanceof Response) return walletOrResp;
  const wallet = walletOrResp;
  let body: any = null;
  try { body = await request.json(); } catch { return new Response(JSON.stringify({ error: 'Invalid JSON' }), { status: 400, headers: { 'Content-Type': 'application/json' } }); }
  const allowed = ['notif_transactions','notif_referrals','notif_badges','notif_security','email','web_push'];
  const payload: Record<string, any> = { wallet_address: wallet, updated_at: new Date().toISOString() };
  for (const [k,v] of Object.entries(body||{})) {
    if (!allowed.includes(k)) continue;
    payload[k] = v;
  }
  const { data, error } = await supabaseAdmin
    .from('user_settings')
    .upsert(payload, { onConflict: 'wallet_address' })
    .select('*')
    .single();
  if (error) return new Response(JSON.stringify({ error: error.message }), { status: 400, headers: { 'Content-Type': 'application/json' } });
  // Log preference update as a delivery event for observability
  try { await supabaseAdmin.from('event_logs').insert([{ event_type: 'notif_prefs_updated', wallet_address: wallet, metadata: payload }]); } catch {}
  return new Response(JSON.stringify({ status: 'ok', data }), { status: 200, headers: { 'Content-Type': 'application/json' } });
}
