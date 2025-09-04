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
  if (!isAdminEnabled() || !supabaseAdmin) return new Response(JSON.stringify({ data: null, supported: false }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  const walletOrResp = await getWalletFromRequest(request);
  if (walletOrResp instanceof Response) return walletOrResp;
  const wallet = walletOrResp;

  try {
    const { data, error } = await supabaseAdmin
      .from('user_settings')
      .select('*')
      .eq('wallet_address', wallet)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return new Response(JSON.stringify({ data }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (e: any) {
    return new Response(JSON.stringify({ data: null, skipped: true, reason: e?.message || 'unavailable' }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  }
}

function validateSettings(body: any): { ok: boolean; data?: Record<string, any>; error?: string } {
  if (!body || typeof body !== 'object') return { ok: false, error: 'Invalid payload' };
  const allowedKeys = new Set([
    'hide_pnl','hide_volume','hide_badges','analytics_opt_out','theme','language','font_size','high_contrast'
  ]);
  const result: Record<string, any> = {};
  for (const [k, v] of Object.entries(body)) {
    if (!allowedKeys.has(k)) continue;
    switch (k) {
      case 'hide_pnl':
      case 'hide_volume':
      case 'hide_badges':
      case 'analytics_opt_out':
      case 'high_contrast':
        if (typeof v !== 'boolean') return { ok: false, error: `${k} must be boolean` };
        result[k] = v; break;
      case 'theme':
        if (typeof v !== 'string' || !['system','dark','light'].includes(v)) return { ok: false, error: 'theme invalid' };
        result[k] = v; break;
      case 'language':
        if (typeof v !== 'string') return { ok: false, error: 'language invalid' };
        result[k] = v; break;
      case 'font_size':
        if (typeof v !== 'string' || !['default','large','xlarge'].includes(v)) return { ok: false, error: 'font_size invalid' };
        result[k] = v; break;
    }
  }
  if (!Object.keys(result).length) return { ok: false, error: 'No valid fields to update' };
  return { ok: true, data: result };
}

export async function PATCH(request: NextRequest) {
  if (!isAdminEnabled() || !supabaseAdmin) {
    // Gracefully accept client preference changes even if backend isn't configured
    const walletOrResp = await getWalletFromRequest(request);
    if (walletOrResp instanceof Response) return walletOrResp;
    let body: any = null; try { body = await request.json(); } catch {}
    return new Response(JSON.stringify({ data: { wallet_address: walletOrResp, ...body }, supported: false, skipped: true }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  }
  const walletOrResp = await getWalletFromRequest(request);
  if (walletOrResp instanceof Response) return walletOrResp;
  const wallet = walletOrResp;

  let body: any = null;
  try { body = await request.json(); } catch (e) { console.error('PATCH /api/settings invalid JSON', e); return new Response(JSON.stringify({ error: 'Invalid JSON' }), { status: 400, headers: { 'Content-Type': 'application/json' } }); }
  const val = validateSettings(body);
  if (!val.ok) {
    console.warn('PATCH /api/settings validation failed', { wallet, body, error: val.error });
    return new Response(JSON.stringify({ error: val.error }), { status: 400, headers: { 'Content-Type': 'application/json' } });
  }

  const payload = { wallet_address: wallet, ...val.data, updated_at: new Date().toISOString() };
  try {
    const { data, error } = await supabaseAdmin
      .from('user_settings')
      .upsert(payload, { onConflict: 'wallet_address' })
      .select('*')
      .single();
    if (error) throw new Error(error.message);
    return new Response(JSON.stringify({ data }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (e: any) {
    console.warn('PATCH /api/settings degraded due to backend error', e?.message);
    return new Response(JSON.stringify({ data: payload, skipped: true, reason: e?.message || 'unavailable' }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  }
}
