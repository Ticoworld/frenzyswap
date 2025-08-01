-- Supabase Database Schema for FrenzySwap Analytics
-- Run this SQL in your Supabase SQL Editor

-- Create swap_records table
CREATE TABLE IF NOT EXISTS swap_records (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  wallet_address TEXT NOT NULL,
  from_token TEXT NOT NULL,
  to_token TEXT NOT NULL,
  from_amount DECIMAL(20, 9) NOT NULL,
  to_amount DECIMAL(20, 9) NOT NULL,
  from_usd_value DECIMAL(20, 2),
  to_usd_value DECIMAL(20, 2),
  fees_paid DECIMAL(20, 9),
  fees_usd_value DECIMAL(20, 2),
  signature TEXT UNIQUE NOT NULL,
  block_time BIGINT,
  jupiter_fee DECIMAL(20, 9),
  platform_fee DECIMAL(20, 9),
  meme_burned DECIMAL(20, 9),
  slippage DECIMAL(5, 4),
  route_plan TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create platform_stats table for caching aggregated statistics
CREATE TABLE IF NOT EXISTS platform_stats (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  total_volume_usd DECIMAL(20, 2) DEFAULT 0,
  total_swaps BIGINT DEFAULT 0,
  total_earnings_usd DECIMAL(20, 2) DEFAULT 0,
  total_meme_burned DECIMAL(20, 9) DEFAULT 0,
  unique_wallets BIGINT DEFAULT 0,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert initial stats record
INSERT INTO platform_stats (total_volume_usd, total_swaps, total_earnings_usd, total_meme_burned, unique_wallets)
VALUES (0, 0, 0, 0, 0)
ON CONFLICT DO NOTHING;

-- Create analytics tables for website tracking

-- Table for page views
CREATE TABLE IF NOT EXISTS page_views (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  page_path TEXT NOT NULL,
  user_agent TEXT,
  referrer TEXT,
  session_id TEXT NOT NULL,
  wallet_address TEXT,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table for wallet connections
CREATE TABLE IF NOT EXISTS wallet_connections (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  wallet_address TEXT NOT NULL,
  wallet_type TEXT NOT NULL,
  session_id TEXT NOT NULL,
  is_first_connection BOOLEAN DEFAULT FALSE,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table for user sessions
CREATE TABLE IF NOT EXISTS user_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT UNIQUE NOT NULL,
  wallet_address TEXT,
  pages_visited INTEGER DEFAULT 0,
  time_spent INTEGER DEFAULT 0, -- seconds
  first_visit TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_swap_records_wallet ON swap_records(wallet_address);
CREATE INDEX IF NOT EXISTS idx_swap_records_created_at ON swap_records(created_at);
CREATE INDEX IF NOT EXISTS idx_swap_records_signature ON swap_records(signature);
CREATE INDEX IF NOT EXISTS idx_swap_records_from_token ON swap_records(from_token);
CREATE INDEX IF NOT EXISTS idx_swap_records_to_token ON swap_records(to_token);

-- Create indexes for analytics tables
CREATE INDEX IF NOT EXISTS idx_page_views_session ON page_views(session_id);
CREATE INDEX IF NOT EXISTS idx_page_views_timestamp ON page_views(timestamp);
CREATE INDEX IF NOT EXISTS idx_page_views_wallet ON page_views(wallet_address);
CREATE INDEX IF NOT EXISTS idx_wallet_connections_wallet ON wallet_connections(wallet_address);
CREATE INDEX IF NOT EXISTS idx_wallet_connections_session ON wallet_connections(session_id);
CREATE INDEX IF NOT EXISTS idx_wallet_connections_timestamp ON wallet_connections(timestamp);
CREATE INDEX IF NOT EXISTS idx_user_sessions_session ON user_sessions(session_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_wallet ON user_sessions(wallet_address);
CREATE INDEX IF NOT EXISTS idx_user_sessions_first_visit ON user_sessions(first_visit);

-- Create a function to update platform stats
CREATE OR REPLACE FUNCTION update_platform_stats()
RETURNS void AS $$
BEGIN
  UPDATE platform_stats SET
    total_volume_usd = (
      SELECT COALESCE(SUM(from_usd_value), 0) 
      FROM swap_records 
      WHERE from_usd_value IS NOT NULL
    ),
    total_swaps = (SELECT COUNT(*) FROM swap_records),
    total_earnings_usd = (
      SELECT COALESCE(SUM(fees_usd_value), 0) 
      FROM swap_records 
      WHERE fees_usd_value IS NOT NULL
    ),
    total_meme_burned = (
      SELECT COALESCE(SUM(meme_burned), 0) 
      FROM swap_records 
      WHERE meme_burned IS NOT NULL
    ),
    unique_wallets = (
      SELECT COUNT(DISTINCT wallet_address) 
      FROM swap_records
    ),
    last_updated = NOW()
  WHERE id = (SELECT id FROM platform_stats ORDER BY created_at LIMIT 1);
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to automatically update stats when a new swap is recorded
CREATE OR REPLACE FUNCTION trigger_update_platform_stats()
RETURNS trigger AS $$
BEGIN
  PERFORM update_platform_stats();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER swap_records_stats_trigger
  AFTER INSERT ON swap_records
  FOR EACH ROW
  EXECUTE FUNCTION trigger_update_platform_stats();

-- Enable Row Level Security (RLS) for additional security
ALTER TABLE swap_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE page_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallet_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access to stats and swap records
CREATE POLICY "Public can read platform stats" ON platform_stats
  FOR SELECT USING (true);

CREATE POLICY "Public can read swap records" ON swap_records
  FOR SELECT USING (true);

CREATE POLICY "Public can read page views" ON page_views
  FOR SELECT USING (true);

CREATE POLICY "Public can read wallet connections" ON wallet_connections
  FOR SELECT USING (true);

CREATE POLICY "Public can read user sessions" ON user_sessions
  FOR SELECT USING (true);

-- Create policy for inserting records
CREATE POLICY "Authenticated can insert swap records" ON swap_records
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can insert page views" ON page_views
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can insert wallet connections" ON wallet_connections
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can insert user sessions" ON user_sessions
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can update user sessions" ON user_sessions
  FOR UPDATE USING (true);

-- Grant permissions
GRANT SELECT ON platform_stats TO anon, authenticated;
GRANT SELECT ON swap_records TO anon, authenticated;
GRANT SELECT ON page_views TO anon, authenticated;
GRANT SELECT ON wallet_connections TO anon, authenticated;
GRANT SELECT ON user_sessions TO anon, authenticated;
GRANT INSERT ON swap_records TO anon, authenticated;
GRANT INSERT ON page_views TO anon, authenticated;
GRANT INSERT ON wallet_connections TO anon, authenticated;
GRANT INSERT, UPDATE ON user_sessions TO anon, authenticated;
GRANT USAGE ON SCHEMA public TO anon, authenticated;
