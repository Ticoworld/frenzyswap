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



// Unified access decision flow: supports /login?ref=<wallet> only
import { createReferral } from './referrals'
export async function hasAccessOrOnboard(wallet: string, ref?: string) {
  const w = wallet.toLowerCase()
  // DB check
  if (await isWhitelistedDB(w)) return { access: true, reason: 'db_whitelist' as const }
  // ENV bootstrap
  const migrated = await migrateEnvIfEligible(w)
  if (migrated) return { access: true, reason: 'env_bootstrap' as const }
  // Referral onboarding
  if (ref && ref.toLowerCase() !== w) {
    // Add to whitelist, log referral, award points
    await addToWhitelistDB(w, 'referral', ref.toLowerCase())
    await createReferral(ref.toLowerCase(), w)
    // Award points for accepted referral
    try { await awardPoints({ wallet: ref.toLowerCase(), points: PointsPolicy.referralAccepted, reason: 'referral_accepted', metadata: { invitee: w } }) } catch {}
    return { access: true, reason: 'referral', inviter: ref.toLowerCase() }
  }
  // No access
  return { access: false, reason: 'waitlist' as const }
}
