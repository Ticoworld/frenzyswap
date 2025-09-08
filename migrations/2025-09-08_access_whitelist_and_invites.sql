-- Access whitelist and invite tokens

-- Whitelist table
CREATE TABLE IF NOT EXISTS access_whitelist (
  wallet_address TEXT PRIMARY KEY,
  source TEXT NOT NULL DEFAULT 'manual', -- manual|env_bootstrap|referral
  added_at TIMESTAMPTZ DEFAULT NOW(),
  added_by TEXT
);

ALTER TABLE IF EXISTS access_whitelist ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy p JOIN pg_class c ON p.polrelid=c.oid
    WHERE p.polname='public_select_access_whitelist' AND c.relname='access_whitelist'
  ) THEN
    CREATE POLICY public_select_access_whitelist ON access_whitelist FOR SELECT USING (true);
  END IF;
END $$;
REVOKE INSERT, UPDATE, DELETE ON access_whitelist FROM anon, authenticated;
CREATE INDEX IF NOT EXISTS idx_access_whitelist_wallet ON access_whitelist(wallet_address);

-- Invite tokens for secure referral onboarding
CREATE TABLE IF NOT EXISTS invite_tokens (
  token TEXT PRIMARY KEY,
  inviter_wallet TEXT NOT NULL,
  max_uses INT NOT NULL DEFAULT 1,
  uses INT NOT NULL DEFAULT 0,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  status TEXT DEFAULT 'active' -- active|revoked|expired
);

ALTER TABLE IF EXISTS invite_tokens ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy p JOIN pg_class c ON p.polrelid=c.oid
    WHERE p.polname='public_select_invite_tokens' AND c.relname='invite_tokens'
  ) THEN
    CREATE POLICY public_select_invite_tokens ON invite_tokens FOR SELECT USING (true);
  END IF;
END $$;
REVOKE INSERT, UPDATE, DELETE ON invite_tokens FROM anon, authenticated;
CREATE INDEX IF NOT EXISTS idx_invite_tokens_inviter ON invite_tokens(inviter_wallet);

-- Materialized/log table for successful invite acceptances (optional)
CREATE TABLE IF NOT EXISTS invite_acceptances (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  token TEXT,
  inviter_wallet TEXT NOT NULL,
  invitee_wallet TEXT NOT NULL,
  accepted_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE IF EXISTS invite_acceptances ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy p JOIN pg_class c ON p.polrelid=c.oid
    WHERE p.polname='public_select_invite_acceptances' AND c.relname='invite_acceptances'
  ) THEN
    CREATE POLICY public_select_invite_acceptances ON invite_acceptances FOR SELECT USING (true);
  END IF;
END $$;
REVOKE INSERT, UPDATE, DELETE ON invite_acceptances FROM anon, authenticated;
CREATE INDEX IF NOT EXISTS idx_invite_acceptances_inviter ON invite_acceptances(inviter_wallet);
CREATE INDEX IF NOT EXISTS idx_invite_acceptances_invitee ON invite_acceptances(invitee_wallet);

-- Optional helper RPC for atomic invite use increments
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_proc WHERE proname = 'increment_invite_use'
  ) THEN
    CREATE OR REPLACE FUNCTION increment_invite_use(p_token TEXT)
    RETURNS VOID AS $$
    BEGIN
      UPDATE invite_tokens SET uses = uses + 1
      WHERE token = p_token AND status = 'active';
    END;
    $$ LANGUAGE plpgsql;
  END IF;
END $$;
