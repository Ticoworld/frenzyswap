import { supabase, isAnalyticsEnabled } from './supabase'
import { supabaseAdmin } from './supabaseAdmin'

export interface TradeLot {
  token: string // mint or symbol (prefer mint if available in route_plan)
  amount: number // positive for buy, negative for sell (token units)
  usd: number // USD notional at time of trade (positive buy, negative sell)
  timestamp: string
  signature?: string
}

export interface PnlSummary {
  realizedPnlUsd: number
  feesUsd: number
  totalVolumeUsd: number
}

// Fetch user trades from swap_records and project into buy/sell lots in base USD terms.
// Simplification: treat 'from_' leg as sell and 'to_' leg as buy; USD notional is from_usd_value/to_usd_value if present.
export async function getUserTradeLots(wallet: string): Promise<TradeLot[]> {
  if (!isAnalyticsEnabled()) return []
  const { data, error } = await supabase!
    .from('swap_records')
    .select('from_token, to_token, from_amount, to_amount, from_usd_value, to_usd_value, created_at, signature')
    .eq('wallet_address', wallet)
    .order('created_at', { ascending: true })
  if (error) {
    console.error('[PnL] fetch trades error:', error)
    return []
  }
  const lots: TradeLot[] = []
  for (const r of data || []) {
    if (r.from_token) {
      lots.push({
        token: r.from_token,
        amount: -Number(r.from_amount || 0),
        usd: -Number(r.from_usd_value || 0),
        timestamp: r.created_at,
        signature: r.signature,
      })
    }
    if (r.to_token) {
      lots.push({
        token: r.to_token,
        amount: Number(r.to_amount || 0),
        usd: Number(r.to_usd_value || 0),
        timestamp: r.created_at,
        signature: r.signature,
      })
    }
  }
  return lots
}

// FIFO realized P&L per token: match sells against prior buys
export function computeRealizedPnl(lots: TradeLot[]): PnlSummary {
  const fifo: Record<string, Array<{ qty: number; costUsd: number }>> = {}
  let realized = 0
  let feesUsd = 0
  let volume = 0

  // Volume: sum of absolute USD notionals
  for (const l of lots) volume += Math.abs(l.usd || 0)

  // Build FIFO per token
  for (const l of lots) {
    const token = l.token
    fifo[token] = fifo[token] || []
    if (l.amount > 0) {
      // buy
      // if l.usd is 0 (missing), skip adding cost basis for now
      fifo[token].push({ qty: l.amount, costUsd: l.usd || 0 })
    } else if (l.amount < 0) {
      // sell
      let qtyToSell = -l.amount
      let proceedsUsd = -(l.usd || 0) // l.usd is negative for sells
      let cost = 0
      while (qtyToSell > 1e-18 && fifo[token]?.length) {
        const lot = fifo[token][0]
        const takeQty = Math.min(lot.qty, qtyToSell)
        const avgCostPerUnit = lot.costUsd / (lot.qty || 1)
        cost += takeQty * avgCostPerUnit
        lot.qty -= takeQty
        lot.costUsd -= takeQty * avgCostPerUnit
        qtyToSell -= takeQty
        if (lot.qty <= 1e-18) fifo[token].shift()
      }
      // any remaining qtyToSell is unmatched; assume zero cost basis
      realized += proceedsUsd - cost
    }
  }

  return { realizedPnlUsd: round2(realized), feesUsd: round2(feesUsd), totalVolumeUsd: round2(volume) }
}

export function round2(n: number) {
  return Math.round(n * 100) / 100
}

export async function getUserPnl(wallet: string): Promise<PnlSummary> {
  const lots = await getUserTradeLots(wallet)
  return computeRealizedPnl(lots)
}

export async function upsertUserPnlCache(wallet: string, summary: PnlSummary) {
  if (!isAnalyticsEnabled()) return { success: false, skipped: true }
  try {
  const client = (supabaseAdmin || supabase)!
  const { error } = await client
      .from('user_pnl_cache')
      .upsert({
        wallet_address: wallet,
        realized_pnl_usd: summary.realizedPnlUsd,
        fees_paid_usd: summary.feesUsd,
        total_volume_usd: summary.totalVolumeUsd,
        last_calculated: new Date().toISOString(),
      })
    if (error) throw error
    return { success: true }
  } catch (e) {
    console.error('[PnL] upsert cache failed:', e)
    return { success: false, error: String(e) }
  }
}
