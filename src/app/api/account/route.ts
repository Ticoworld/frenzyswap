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
  if (!isAdminEnabled() || !supabaseAdmin) return new Response(JSON.stringify({ error: 'Server not configured' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  const walletOrResp = await getWalletFromRequest(request);
  if (walletOrResp instanceof Response) return walletOrResp;
  const wallet = walletOrResp;

  const url = new URL(request.url);
  const action = url.searchParams.get('action');
  if (action !== 'export') {
    return new Response(JSON.stringify({ error: 'Unsupported action' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
  }

  // Pull data across related tables for export
  const tables = {
    user_profiles: await supabaseAdmin.from('user_profiles').select('*').eq('wallet_address', wallet),
    user_points_ledger: await supabaseAdmin.from('user_points_ledger').select('*').eq('wallet_address', wallet),
    user_streaks: await supabaseAdmin.from('user_streaks').select('*').eq('wallet_address', wallet),
    referrals_as_referrer: await supabaseAdmin.from('referrals').select('*').eq('referrer_wallet', wallet),
    referrals_as_referee: await supabaseAdmin.from('referrals').select('*').eq('referee_wallet', wallet),
    event_logs: await supabaseAdmin.from('event_logs').select('*').or(`wallet_address.eq.${wallet},ref_wallet_address.eq.${wallet}`),
    user_pnl_cache: await supabaseAdmin.from('user_pnl_cache').select('*').eq('wallet_address', wallet),
    user_badges: await supabaseAdmin.from('user_badges').select('*').eq('wallet_address', wallet),
    user_sessions: await supabaseAdmin.from('user_sessions').select('*').eq('wallet_address', wallet)
  } as const;

  const errors = Object.entries(tables).filter(([, r]: any) => r.error).map(([k, r]: any) => `${k}: ${r.error.message}`);
  if (errors.length) {
    return new Response(JSON.stringify({ error: 'Failed to export', details: errors }), { status: 400, headers: { 'Content-Type': 'application/json' } });
  }

  const payload: any = {};
  for (const [k, r] of Object.entries(tables) as any) payload[k] = r.data || [];

  return new Response(JSON.stringify(payload), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Content-Disposition': `attachment; filename="frenzyswap-export-${wallet}.json"`
    }
  });
}

export async function DELETE(request: NextRequest) {
  // TODO: Implement account deletion with safeguards and GDPR compliance.
  // For now, return 202 Accepted with instructions.
  return new Response(JSON.stringify({ accepted: true, message: 'Deletion request received. We will process this manually. Contact support to expedite.' }), { status: 202, headers: { 'Content-Type': 'application/json' } });
}
