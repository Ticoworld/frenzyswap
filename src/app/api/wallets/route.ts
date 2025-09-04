import { NextRequest } from 'next/server';
import { PublicKey } from '@solana/web3.js';
import bs58 from 'bs58';
import nacl from 'tweetnacl';
import { requireAuth } from '@/lib/auth';
import { isAdminEnabled, supabaseAdmin } from '@/lib/supabaseAdmin';

function json(data: any, status = 200) { return new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json' } }); }

async function getOwner(request: NextRequest): Promise<string | Response> {
  const auth = requireAuth(request);
  if (auth instanceof Response) {
    const w = request.headers.get('x-wallet');
    if (!w) return json({ error: 'Wallet not provided' }, 401);
    return w.toLowerCase();
  }
  return auth.walletAddress.toLowerCase();
}

export async function GET(request: NextRequest) {
  if (!isAdminEnabled() || !supabaseAdmin) return json({ data: [], supported: false });
  const ownerOrResp = await getOwner(request); if (ownerOrResp instanceof Response) return ownerOrResp;
  const owner = ownerOrResp;
  try {
    const { data, error } = await supabaseAdmin
      .from('user_wallets')
      .select('id, owner_wallet, linked_wallet, is_primary, linked_at')
      .eq('owner_wallet', owner)
      .order('linked_at', { ascending: false });
    if (error) throw new Error(error.message);
    return json({ data });
  } catch (e: any) {
    return json({ data: [], skipped: true, reason: e?.message || 'unavailable' });
  }
}

export async function POST(request: NextRequest) {
  if (!isAdminEnabled() || !supabaseAdmin) return json({ error: 'Server not configured' }, 500);
  const ownerOrResp = await getOwner(request); if (ownerOrResp instanceof Response) return ownerOrResp;
  const owner = ownerOrResp;

  let body: any; try { body = await request.json(); } catch { return json({ error: 'Invalid JSON' }, 400); }
  const { linked_wallet, signature, message } = body || {};
  if (!linked_wallet || !signature || !message) return json({ error: 'linked_wallet, signature, message required' }, 400);

  // Verify signature for message using linked_wallet
  try {
    const pub = new PublicKey(linked_wallet);
    const sigBytes = bs58.decode(signature);
    const msgBytes = new TextEncoder().encode(message);
  const ok = nacl.sign.detached.verify(msgBytes, sigBytes, pub.toBytes());
    if (!ok) return json({ error: 'Invalid signature' }, 400);
  } catch (e) {
    return json({ error: 'Signature verification failed' }, 400);
  }

  const { data, error } = await supabaseAdmin
    .from('user_wallets')
    .upsert({ owner_wallet: owner, linked_wallet: linked_wallet.toLowerCase(), is_primary: false })
    .select('*');
  if (error) return json({ error: error.message }, 400);
  return json({ data });
}

export async function PATCH(request: NextRequest) {
  if (!isAdminEnabled() || !supabaseAdmin) return json({ error: 'Server not configured' }, 500);
  const ownerOrResp = await getOwner(request); if (ownerOrResp instanceof Response) return ownerOrResp;
  const owner = ownerOrResp;
  let body: any; try { body = await request.json(); } catch { return json({ error: 'Invalid JSON' }, 400); }
  const { linked_wallet, make_primary } = body || {};
  if (!linked_wallet) return json({ error: 'linked_wallet required' }, 400);
  // Make primary
  if (make_primary === true) {
    const lower = linked_wallet.toLowerCase();
    const { error: e1 } = await supabaseAdmin.from('user_wallets').update({ is_primary: false }).eq('owner_wallet', owner);
    if (e1) return json({ error: e1.message }, 400);
    const { data, error } = await supabaseAdmin.from('user_wallets').update({ is_primary: true }).eq('owner_wallet', owner).eq('linked_wallet', lower).select('*');
    if (error) return json({ error: error.message }, 400);
    return json({ data });
  }
  return json({ error: 'No action' }, 400);
}

export async function DELETE(request: NextRequest) {
  if (!isAdminEnabled() || !supabaseAdmin) return json({ error: 'Server not configured' }, 500);
  const ownerOrResp = await getOwner(request); if (ownerOrResp instanceof Response) return ownerOrResp;
  const owner = ownerOrResp;
  let body: any; try { body = await request.json(); } catch { return json({ error: 'Invalid JSON' }, 400); }
  const { linked_wallet } = body || {};
  if (!linked_wallet) return json({ error: 'linked_wallet required' }, 400);
  const { error } = await supabaseAdmin.from('user_wallets').delete().eq('owner_wallet', owner).eq('linked_wallet', linked_wallet.toLowerCase());
  if (error) return json({ error: error.message }, 400);
  return json({ ok: true });
}
