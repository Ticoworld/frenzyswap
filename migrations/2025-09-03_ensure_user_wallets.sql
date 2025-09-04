-- Ensure user_wallets table exists with required columns and indexes
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'user_wallets'
  ) THEN
    CREATE TABLE public.user_wallets (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      owner_wallet TEXT NOT NULL,
      linked_wallet TEXT NOT NULL,
      is_primary BOOLEAN DEFAULT FALSE,
      linked_at TIMESTAMPTZ DEFAULT NOW(),
      UNIQUE(owner_wallet, linked_wallet)
    );
    ALTER TABLE public.user_wallets ENABLE ROW LEVEL SECURITY;
    CREATE POLICY IF NOT EXISTS "public_select_user_wallets" ON public.user_wallets FOR SELECT USING (true);
    CREATE INDEX IF NOT EXISTS idx_user_wallets_owner ON public.user_wallets(owner_wallet);
    CREATE INDEX IF NOT EXISTS idx_user_wallets_linked ON public.user_wallets(linked_wallet);
    REVOKE INSERT, UPDATE, DELETE ON public.user_wallets FROM anon, authenticated;
  END IF;
END$$;
