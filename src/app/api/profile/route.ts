import { NextRequest } from 'next/server';
import { supabaseAdmin, isAdminEnabled } from '@/lib/supabaseAdmin';
import { requireAuth } from '@/lib/auth';
import { PublicKey } from '@solana/web3.js';

export async function PATCH(request: NextRequest) {
  let wallet: string | null = null;
  const auth = requireAuth(request);
  if (auth instanceof Response) {
    // Dev fallback: allow x-wallet header to set own profile privacy (non-authenticated)
    wallet = request.headers.get('x-wallet');
    if (!wallet) {
      // No auth and no x-wallet provided
      return new Response(
        JSON.stringify({ error: 'Wallet not provided. Authenticate or include x-wallet header.' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }
  } else {
    wallet = auth.walletAddress;
  }
  if (!isAdminEnabled() || !supabaseAdmin) {
    return new Response(JSON.stringify({ error: 'Server not configured' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }

  try {
    const body = await request.json();
    if (typeof body?.is_private !== 'boolean') {
      return new Response(
        JSON.stringify({ error: 'Invalid payload: is_private must be a boolean.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
    const is_private: boolean = body.is_private;

    // Validate wallet address (Solana base58 32-byte public key)
    try {
      // Throws if invalid
      // Normalize to base58 string from PublicKey
      wallet = new PublicKey(wallet!).toBase58();
    } catch {
      return new Response(
        JSON.stringify({ error: 'Invalid wallet address format.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const { error } = await supabaseAdmin
      .from('user_profiles')
      .upsert({ wallet_address: wallet!, is_private }, { onConflict: 'wallet_address' });

    if (error) throw error;

    return new Response(JSON.stringify({ ok: true, is_private }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e?.message || 'Failed to update profile' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
  }
}
