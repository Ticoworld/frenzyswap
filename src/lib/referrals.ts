import { supabase, isAnalyticsEnabled } from './supabase'
import { supabaseAdmin } from './supabaseAdmin'
import { awardPoints, PointsPolicy, logEvent } from './gamification'

export async function createReferral(referrer: string, referee: string) {
  if (!isAnalyticsEnabled()) return { success: false, skipped: true }
  if (!referrer || !referee || referrer.toLowerCase() === referee.toLowerCase()) {
    return { success: false, error: 'Invalid referral' }
  }
  try {
    const client = (supabaseAdmin || supabase)!
    // Velocity cap: max 5 referrals created per wallet per hour
    const hourAgo = new Date(Date.now() - 3_600_000).toISOString()
    const { count } = await client.from('referrals').select('*', { count: 'exact', head: true }).eq('referrer_wallet', referrer).gte('created_at', hourAgo)
    if ((count || 0) > 5) {
      await logEvent({ event_type: 'fraud_velocity_cap', wallet_address: referrer, metadata: { reason: 'referrals_rate_limit', count } })
      return { success: false, error: 'Rate limited' }
    }
    // Blacklist check
    try {
      const { data: bl } = await client.from('blacklisted_wallets').select('wallet_address').in('wallet_address', [referrer, referee]).limit(2)
      if (bl && bl.length) return { success: false, error: 'Blacklisted wallet' }
    } catch {}

    const { data, error } = await client
      .from('referrals')
      .insert([{ referrer_wallet: referrer, referee_wallet: referee, status: 'pending' }])
      .select()
    if (error && error.code !== '23505') throw error // ignore unique violation
    await logEvent({ event_type: 'referral_created', wallet_address: referrer, ref_wallet_address: referee })
    return { success: true, data: data?.[0] }
  } catch (e) {
    console.error('[Referral] create failed:', e)
    return { success: false, error: String(e) }
  }
}

// Mark referral as verified on referee’s first successful swap
export async function verifyReferralIfAny(referee: string) {
  if (!isAnalyticsEnabled()) return { success: false, skipped: true }
  try {
  const client = (supabaseAdmin || supabase)!
  const { data } = await client
      .from('referrals')
      .select('*')
      .eq('referee_wallet', referee)
      .limit(1)
    const ref = data?.[0]
    if (!ref || ref.status === 'verified') return { success: false, message: 'no pending referral' }

  const { error } = await client
      .from('referrals')
      .update({ status: 'verified', verified_at: new Date().toISOString() })
      .eq('id', ref.id)
    if (error) throw error

    // Award points to referrer; optional small award to referee
    await awardPoints({ wallet: ref.referrer_wallet, points: PointsPolicy.referralVerified, reason: 'referral_verified', metadata: { referee } })
    await logEvent({ event_type: 'referral_verified', wallet_address: ref.referrer_wallet, ref_wallet_address: referee })
    return { success: true }
  } catch (e) {
    console.error('[Referral] verify failed:', e)
    return { success: false, error: String(e) }
  }
}
