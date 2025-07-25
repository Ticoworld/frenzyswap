// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js'

// Check if Supabase is configured (Phase 2 feature)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Only create client if both credentials are available
export const supabase = (supabaseUrl && supabaseAnonKey) 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null

// Helper function to check if analytics is enabled
export const isAnalyticsEnabled = () => {
  return !!(supabaseUrl && supabaseAnonKey && supabase)
}

// Database Types matching the actual schema
export interface SwapRecord {
  id?: string
  wallet_address: string
  from_token: string
  to_token: string
  from_amount: number
  to_amount: number
  from_usd_value?: number | null
  to_usd_value?: number | null
  fees_paid?: number | null
  fees_usd_value?: number | null
  signature: string
  block_time?: number | null
  jupiter_fee?: number | null
  platform_fee?: number | null
  meme_burned?: number | null
  slippage?: number | null
  route_plan?: string | null
  created_at?: string
}

export interface PlatformStats {
  id?: string
  total_volume_usd: number
  total_swaps: number
  total_earnings_usd: number
  total_meme_burned: number
  unique_wallets: number
  last_updated: string
  created_at?: string
}
