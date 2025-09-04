-- SECURITY AND JOBS hardening (idempotent)
-- 1) Blacklist table
CREATE TABLE IF NOT EXISTS blacklisted_wallets (
  wallet_address TEXT PRIMARY KEY,
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE IF EXISTS blacklisted_wallets ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy p JOIN pg_class c ON p.polrelid = c.oid
    WHERE p.polname = 'public_select_blacklisted_wallets' AND c.relname = 'blacklisted_wallets'
  ) THEN
    CREATE POLICY "public_select_blacklisted_wallets" ON blacklisted_wallets FOR SELECT USING (true);
  END IF;
END$$;

-- 2) Owner-only read policies for sensitive tables
-- Note: Uses http.request.headers->>'x-wallet' if set by API; otherwise defaults to row owner equality for public key in JWT.
-- You can also use a secure RPC to fetch own data if preferred.
DO $$
BEGIN
  -- user_pnl_cache owner-only read
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy p JOIN pg_class c ON p.polrelid = c.oid
    WHERE p.polname = 'owner_read_user_pnl_cache' AND c.relname = 'user_pnl_cache'
  ) THEN
    CREATE POLICY "owner_read_user_pnl_cache" ON user_pnl_cache
      FOR SELECT
      USING (
        wallet_address = coalesce(current_setting('request.jwt.claims', true)::jsonb->>'wallet_address',
                                   nullif(current_setting('request.headers', true)::jsonb->>'x-wallet',''))
      );
  END IF;

  -- user_points_ledger owner-only read
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy p JOIN pg_class c ON p.polrelid = c.oid
    WHERE p.polname = 'owner_read_user_points_ledger' AND c.relname = 'user_points_ledger'
  ) THEN
    CREATE POLICY "owner_read_user_points_ledger" ON user_points_ledger
      FOR SELECT
      USING (
        wallet_address = coalesce(current_setting('request.jwt.claims', true)::jsonb->>'wallet_address',
                                   nullif(current_setting('request.headers', true)::jsonb->>'x-wallet',''))
      );
  END IF;
END$$;

-- 3) Materialized view refresh function
CREATE OR REPLACE FUNCTION refresh_mv_leaderboard_points()
RETURNS void LANGUAGE plpgsql AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_leaderboard_points;
END $$;

-- 4) Cleanup function (safe redefinition)
CREATE OR REPLACE FUNCTION cleanup_old_analytics()
RETURNS void LANGUAGE plpgsql AS $$
BEGIN
  DELETE FROM page_views WHERE timestamp < NOW() - INTERVAL '6 months';
  DELETE FROM wallet_connections WHERE timestamp < NOW() - INTERVAL '6 months';
  DELETE FROM user_sessions WHERE start_time < NOW() - INTERVAL '6 months';
END $$;

-- 4b) User privacy flag for leaderboards
ALTER TABLE IF EXISTS user_profiles
  ADD COLUMN IF NOT EXISTS is_private BOOLEAN DEFAULT FALSE;

-- 5) Optional pg_cron schedules (uncomment in Supabase once pg_cron is enabled)
-- select cron.schedule('mv-refresh-pts', '*/5 * * * *', $$select refresh_mv_leaderboard_points();$$);
-- select cron.schedule('cleanup-analytics', '0 3 * * 0', $$select cleanup_old_analytics();$$);
