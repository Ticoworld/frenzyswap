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
  if (!isAdminEnabled() || !supabaseAdmin) return new Response(JSON.stringify({ data: [], supported: false }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  const walletOrResp = await getWalletFromRequest(request);
  if (walletOrResp instanceof Response) return walletOrResp;
  const wallet = walletOrResp;

  // Auto-expire sessions older than 7 days since last_activity
  const cutoff = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  try {
    await supabaseAdmin
      .from('user_sessions')
      .update({ end_time: new Date().toISOString() })
      .lt('last_activity', cutoff)
      .is('end_time', null);

    const { data, error } = await supabaseAdmin
      .from('user_sessions')
      .select('session_id, wallet_address, start_time, last_activity, end_time, is_mobile, user_agent')
      .eq('wallet_address', wallet)
      .order('last_activity', { ascending: false })
      .limit(50);
    if (error) throw new Error(error.message);
    return new Response(JSON.stringify({ data }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (e: any) {
    return new Response(JSON.stringify({ data: [], skipped: true, reason: e?.message || 'unavailable' }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  }
}

export async function DELETE(request: NextRequest) {
  if (!isAdminEnabled() || !supabaseAdmin) return new Response(JSON.stringify({ error: 'Server not configured' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  const walletOrResp = await getWalletFromRequest(request);
  if (walletOrResp instanceof Response) return walletOrResp;
  const wallet = walletOrResp;
  const url = new URL(request.url);
  const all = url.searchParams.get('all') === '1';
  const body = all ? {} : await request.json().catch(() => ({}));
  const session_id = body?.session_id as string;
  if (!all && !session_id) return new Response(JSON.stringify({ error: 'session_id required' }), { status: 400, headers: { 'Content-Type': 'application/json' } });

  if (!all) {
    // Ensure session belongs to wallet
    const { data: sess } = await supabaseAdmin
      .from('user_sessions')
      .select('session_id, wallet_address')
      .eq('session_id', session_id)
      .maybeSingle();
    if (!sess || sess.wallet_address !== wallet) {
      return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403, headers: { 'Content-Type': 'application/json' } });
    }
  }

  // Revoke by setting end_time to now
  const q = supabaseAdmin.from('user_sessions').update({ end_time: new Date().toISOString() });
  if (all) {
    q.eq('wallet_address', wallet).is('end_time', null);
  } else {
    q.eq('session_id', session_id);
  }
  const { error } = await q;
  if (error) return new Response(JSON.stringify({ error: error.message }), { status: 400, headers: { 'Content-Type': 'application/json' } });
  return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { 'Content-Type': 'application/json' } });
}
