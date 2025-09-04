import { supabase, isAnalyticsEnabled } from './supabase'
import { supabaseAdmin } from './supabaseAdmin'
import { logEvent } from './gamification'

// Evaluate simple badge criteria and award if eligible
export async function evaluateAndAwardBadges(wallet: string) {
  if (!isAnalyticsEnabled()) return { success: false, skipped: true }
  try {
    const client = (supabaseAdmin || supabase)!
    // Load catalog
    const { data: catalog } = await client.from('badges_catalog').select('*')
    if (!catalog?.length) return { success: false, message: 'no badges' }

    // Gather user stats
    const [{ count: swapCount }, { data: streak }] = await Promise.all([
      client.from('swap_records').select('*', { count: 'exact', head: true }).eq('wallet_address', wallet),
      client.from('user_streaks').select('best_streak_days').eq('wallet_address', wallet).single(),
    ])

    const ownedRes = await client.from('user_badges').select('badge_key').eq('wallet_address', wallet)
    const owned = new Set((ownedRes.data || []).map(x => x.badge_key))

    const toAward: string[] = []
    for (const b of catalog) {
      if (owned.has(b.key)) continue
      const c = b.criteria || {}
      if (c.type === 'swaps' && swapCount! >= (c.threshold || 0)) toAward.push(b.key)
      if (c.type === 'streak' && (streak?.best_streak_days || 0) >= (c.threshold || 0)) toAward.push(b.key)
    }
    for (const key of toAward) {
      await client.from('user_badges').insert([{ wallet_address: wallet, badge_key: key }])
      await logEvent({ event_type: 'badge_awarded', wallet_address: wallet, metadata: { key } })
    }
    return { success: true, awarded: toAward }
  } catch (e) {
    console.error('[Badges] evaluate failed:', e)
    return { success: false, error: String(e) }
  }
}
