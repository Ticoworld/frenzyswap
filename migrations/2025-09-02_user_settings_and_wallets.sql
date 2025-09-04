-- User settings and wallet linking schema

CREATE TABLE IF NOT EXISTS user_settings (
  wallet_address TEXT PRIMARY KEY,
  hide_pnl BOOLEAN DEFAULT FALSE,
  hide_volume BOOLEAN DEFAULT FALSE,
  hide_badges BOOLEAN DEFAULT FALSE,
  analytics_opt_out BOOLEAN DEFAULT FALSE,
  theme TEXT DEFAULT 'system',
  language TEXT DEFAULT 'en',
  font_size TEXT DEFAULT 'default', -- default|large|xlarge
  high_contrast BOOLEAN DEFAULT FALSE,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_wallets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_wallet TEXT NOT NULL,
  linked_wallet TEXT NOT NULL,
  is_primary BOOLEAN DEFAULT FALSE,
  linked_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(owner_wallet, linked_wallet)
);

-- RLS & policies (basic public SELECT; writes via service key)
ALTER TABLE IF EXISTS user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS user_wallets ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy p JOIN pg_class c ON p.polrelid = c.oid
    WHERE p.polname = 'public_select_user_settings' AND c.relname = 'user_settings'
  ) THEN
    CREATE POLICY "public_select_user_settings" ON user_settings FOR SELECT USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policy p JOIN pg_class c ON p.polrelid = c.oid
    WHERE p.polname = 'public_select_user_wallets' AND c.relname = 'user_wallets'
  ) THEN
    CREATE POLICY "public_select_user_wallets" ON user_wallets FOR SELECT USING (true);
  END IF;
END$$;

REVOKE INSERT, UPDATE, DELETE ON user_settings FROM anon, authenticated;
REVOKE INSERT, UPDATE, DELETE ON user_wallets FROM anon, authenticated;

-- Helpful indexes
CREATE INDEX IF NOT EXISTS idx_user_wallets_owner ON user_wallets(owner_wallet);
CREATE INDEX IF NOT EXISTS idx_user_wallets_linked ON user_wallets(linked_wallet);
