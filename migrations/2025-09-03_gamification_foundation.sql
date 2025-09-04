-- Gamification foundation tables (idempotent)
CREATE TABLE IF NOT EXISTS user_progress (
  wallet_address TEXT PRIMARY KEY,
  points BIGINT DEFAULT 0,
  level INT DEFAULT 1,
  streak_days INT DEFAULT 0,
  last_activity TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS badges (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  points INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_badges (
  wallet_address TEXT NOT NULL,
  badge_code TEXT NOT NULL REFERENCES badges(code),
  earned_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY(wallet_address, badge_code)
);

CREATE TABLE IF NOT EXISTS user_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  wallet_address TEXT NOT NULL,
  event_type TEXT NOT NULL,
  amount NUMERIC,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS referrals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  referrer_wallet TEXT NOT NULL,
  referred_wallet TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(referrer_wallet, referred_wallet)
);

-- Basic RLS + read policies (writes via service key)
ALTER TABLE IF EXISTS user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS user_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS referrals ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'public_select_user_progress') THEN
    CREATE POLICY public_select_user_progress ON user_progress FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'public_select_badges') THEN
    CREATE POLICY public_select_badges ON badges FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'public_select_user_badges') THEN
    CREATE POLICY public_select_user_badges ON user_badges FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'public_select_user_events') THEN
    CREATE POLICY public_select_user_events ON user_events FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'public_select_referrals') THEN
    CREATE POLICY public_select_referrals ON referrals FOR SELECT USING (true);
  END IF;
END$$;

REVOKE INSERT, UPDATE, DELETE ON user_progress, badges, user_badges, user_events, referrals FROM anon, authenticated;
