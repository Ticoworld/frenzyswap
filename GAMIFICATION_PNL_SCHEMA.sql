-- Gamified Analytics & P&L Schema (Phase 1 foundation)
-- Run after supabase-schema.sql

-- 1) User profile (public stats / privacy-aware)
CREATE TABLE IF NOT EXISTS user_profiles (
  wallet_address TEXT PRIMARY KEY,
  nickname TEXT,
  avatar_url TEXT,
  bio TEXT,
  referrals_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2) Points ledger (immutable event-sourced points)
CREATE TABLE IF NOT EXISTS user_points_ledger (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  wallet_address TEXT NOT NULL,
  points INTEGER NOT NULL,
  reason TEXT NOT NULL,
  metadata JSONB,
  signature TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_user_points_wallet ON user_points_ledger(wallet_address);
CREATE INDEX IF NOT EXISTS idx_user_points_created_at ON user_points_ledger(created_at);

-- 3) User streaks (daily)
CREATE TABLE IF NOT EXISTS user_streaks (
  wallet_address TEXT PRIMARY KEY,
  current_streak_days INTEGER DEFAULT 0,
  best_streak_days INTEGER DEFAULT 0,
  last_swap_date DATE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4) Referrals (basic)
CREATE TABLE IF NOT EXISTS referrals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  referrer_wallet TEXT NOT NULL,
  referee_wallet TEXT NOT NULL,
  status TEXT DEFAULT 'pending', -- pending|verified|rejected
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  verified_at TIMESTAMP WITH TIME ZONE
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_referrals_pair ON referrals(referrer_wallet, referee_wallet);
CREATE INDEX IF NOT EXISTS idx_referrals_referrer ON referrals(referrer_wallet);

-- 5) Event logs (append-only)
CREATE TABLE IF NOT EXISTS event_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_type TEXT NOT NULL,
  wallet_address TEXT,
  ref_wallet_address TEXT,
  signature TEXT,
  tx_hash TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_events_type ON event_logs(event_type);
CREATE INDEX IF NOT EXISTS idx_events_wallet ON event_logs(wallet_address);

-- 6) P&L cache (optional for faster queries)
CREATE TABLE IF NOT EXISTS user_pnl_cache (
  wallet_address TEXT PRIMARY KEY,
  realized_pnl_usd DECIMAL(20,2) DEFAULT 0,
  fees_paid_usd DECIMAL(20,2) DEFAULT 0,
  total_volume_usd DECIMAL(20,2) DEFAULT 0,
  last_calculated TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS & policies
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_points_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_pnl_cache ENABLE ROW LEVEL SECURITY;

-- Public read for aggregate/leaderboards (wallet addresses are public on-chain; avoid exposing sensitive metadata)
CREATE POLICY IF NOT EXISTS "Public read user_profiles" ON user_profiles FOR SELECT USING (true);
CREATE POLICY IF NOT EXISTS "Public read points_ledger" ON user_points_ledger FOR SELECT USING (true);
CREATE POLICY IF NOT EXISTS "Public read user_streaks" ON user_streaks FOR SELECT USING (true);
CREATE POLICY IF NOT EXISTS "Public read referrals" ON referrals FOR SELECT USING (true);
CREATE POLICY IF NOT EXISTS "Public read event_logs" ON event_logs FOR SELECT USING (true);
CREATE POLICY IF NOT EXISTS "Public read user_pnl_cache" ON user_pnl_cache FOR SELECT USING (true);

-- Inserts are allowed broadly for now (can tighten later via service key)
CREATE POLICY IF NOT EXISTS "Insert profiles" ON user_profiles FOR INSERT WITH CHECK (true);
CREATE POLICY IF NOT EXISTS "Insert points" ON user_points_ledger FOR INSERT WITH CHECK (true);
CREATE POLICY IF NOT EXISTS "Upsert streaks" ON user_streaks FOR INSERT WITH CHECK (true);
CREATE POLICY IF NOT EXISTS "Update streaks" ON user_streaks FOR UPDATE USING (true);
CREATE POLICY IF NOT EXISTS "Insert referrals" ON referrals FOR INSERT WITH CHECK (true);
CREATE POLICY IF NOT EXISTS "Insert events" ON event_logs FOR INSERT WITH CHECK (true);
CREATE POLICY IF NOT EXISTS "Upsert pnl cache" ON user_pnl_cache FOR INSERT WITH CHECK (true);
CREATE POLICY IF NOT EXISTS "Update pnl cache" ON user_pnl_cache FOR UPDATE USING (true);

GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT ON user_profiles, user_points_ledger, user_streaks, referrals, event_logs, user_pnl_cache TO anon, authenticated;
GRANT INSERT, UPDATE ON user_profiles, user_points_ledger, user_streaks, referrals, event_logs, user_pnl_cache TO anon, authenticated;

-- 7) Badges (catalog + user awards)
CREATE TABLE IF NOT EXISTS badges_catalog (
  key TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  criteria JSONB, -- e.g., {"type":"swaps","threshold":10}
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_badges (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  wallet_address TEXT NOT NULL,
  badge_key TEXT NOT NULL REFERENCES badges_catalog(key),
  awarded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE (wallet_address, badge_key)
);

ALTER TABLE badges_catalog ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "Public read badges" ON badges_catalog FOR SELECT USING (true);
CREATE POLICY IF NOT EXISTS "Public read user_badges" ON user_badges FOR SELECT USING (true);
CREATE POLICY IF NOT EXISTS "Insert badges_catalog" ON badges_catalog FOR INSERT WITH CHECK (true);
CREATE POLICY IF NOT EXISTS "Insert user_badges" ON user_badges FOR INSERT WITH CHECK (true);

GRANT SELECT ON badges_catalog, user_badges TO anon, authenticated;
GRANT INSERT ON badges_catalog, user_badges TO anon, authenticated;
