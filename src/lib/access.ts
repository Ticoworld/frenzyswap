import { NextRequest } from 'next/server'
import { supabase } from './supabase'
import { supabaseAdmin } from './supabaseAdmin'
import { awardPoints, PointsPolicy } from './gamification'

const client = (supabaseAdmin || supabase)

export async function isWhitelistedDB(wallet: string) {
  if (!client) return false
  const { data } = await client.from('access_whitelist').select('wallet_address').eq('wallet_address', wallet.toLowerCase()).limit(1)
  return !!(data && data.length)
}

export async function addToWhitelistDB(wallet: string, source: 'manual' | 'env_bootstrap' | 'referral', addedBy?: string) {
  if (!client) return { success: false }
  const row = { wallet_address: wallet.toLowerCase(), source, added_by: addedBy || null }
  const { error } = await client.from('access_whitelist').upsert(row, { onConflict: 'wallet_address' } as any)
  return { success: !error }
}

export function envAllowlist(): string[] {
  return (process.env.NEXT_PUBLIC_ALLOWED_WALLETS || '')
    .split(',')
    .map(w => w.trim().toLowerCase())
    .filter(Boolean)
}

export async function migrateEnvIfEligible(wallet: string) {
  const env = envAllowlist()
  const w = wallet.toLowerCase()
  if (env.includes(w)) {
    await addToWhitelistDB(w, 'env_bootstrap')
    return true
  }
  return false
}

export async function isWhitelistedEither(wallet: string) {
  const w = wallet.toLowerCase()
  if (await isWhitelistedDB(w)) return true
  return envAllowlist().includes(w)
}

export function generateInviteToken(inviter: string) {
  // Prefer Web Crypto if available (edge safe)
  if (typeof globalThis !== 'undefined' && (globalThis as any).crypto?.getRandomValues) {
    const arr = new Uint8Array(16)
    ;(globalThis as any).crypto.getRandomValues(arr)
    const token = Array.from(arr).map(b => b.toString(16).padStart(2, '0')).join('')
    return { token, inviter }
  }
  // Fallback to Node crypto via dynamic import (server-only)
  const nodeCrypto = require('crypto') as typeof import('crypto')
  const token = nodeCrypto.randomBytes(16).toString('hex')
  return { token, inviter }
}

export async function createInvite(inviter: string, maxUses = 1, expiresAt?: Date) {
  if (!client) return { success: false, error: 'No DB' }
  const { token } = generateInviteToken(inviter)
  const row = { token, inviter_wallet: inviter.toLowerCase(), max_uses: maxUses, expires_at: expiresAt ? expiresAt.toISOString() : null }
  const { error } = await client.from('invite_tokens').insert([row])
  if (error) return { success: false, error: String(error) }
  return { success: true, token }
}

export async function consumeInviteIfValid(token: string, invitee: string) {
  if (!client) return { success: false, error: 'No DB' }
  const now = new Date().toISOString()
  const { data: rows } = await client
    .from('invite_tokens')
    .select('*')
    .eq('token', token)
    .eq('status', 'active')
    .limit(1)
  const row = rows?.[0]
  if (!row) return { success: false, error: 'Invalid token' }
  if (row.expires_at && row.expires_at < now) return { success: false, error: 'Expired token' }
  if ((row.uses || 0) >= (row.max_uses || 1)) return { success: false, error: 'Token exhausted' }

  // atomic update: increment uses; best-effort simple upsert w/ check
  const { error: upErr } = await client.rpc('increment_invite_use', { p_token: token } as any)
  if (upErr) {
    // fallback update if RPC not present
    await client.from('invite_tokens').update({ uses: (row.uses || 0) + 1 }).eq('token', token)
  }

  // add to whitelist
  await addToWhitelistDB(invitee, 'referral', row.inviter_wallet)

  // log acceptance
  await client.from('invite_acceptances').insert([{ token, inviter_wallet: row.inviter_wallet, invitee_wallet: invitee.toLowerCase() }])

  // Also create referrals row (pending) if not exists
  try {
    await client.from('referrals')
      .insert([{ referrer_wallet: row.inviter_wallet, referred_wallet: invitee.toLowerCase(), status: 'pending' }])
  } catch {}
  // Award immediate points for successful invite acceptance
  try { await awardPoints({ wallet: row.inviter_wallet, points: PointsPolicy.referralAccepted, reason: 'referral_accepted', metadata: { invitee } }) } catch {}
  return { success: true, inviter: row.inviter_wallet }
}

// Primary access decision flow
export async function hasAccessOrOnboard(wallet: string, inviteToken?: string) {
  const w = wallet.toLowerCase()
  // DB check
  if (await isWhitelistedDB(w)) return { access: true, reason: 'db_whitelist' as const }
  // ENV bootstrap
  const migrated = await migrateEnvIfEligible(w)
  if (migrated) return { access: true, reason: 'env_bootstrap' as const }
  // Referral token
  if (inviteToken) {
    const res = await consumeInviteIfValid(inviteToken, w)
    if (res.success) return { access: true, reason: 'referral', inviter: res.inviter }
  }
  // No access
  return { access: false, reason: 'waitlist' as const }
}
