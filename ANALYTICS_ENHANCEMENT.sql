-- Enhanced Analytics Schema for Website Tracking
-- Run this in your Supabase SQL Editor after the existing schema

-- Table to track page views
CREATE TABLE IF NOT EXISTS page_views (
    id SERIAL PRIMARY KEY,
    visitor_id VARCHAR(255),
    page_path VARCHAR(500) NOT NULL,
    user_agent TEXT,
    referrer VARCHAR(500),
    session_id VARCHAR(255),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Performance metrics
    load_time INTEGER, -- in milliseconds
    
    -- User context
    wallet_address VARCHAR(50),
    is_mobile BOOLEAN DEFAULT FALSE
);

-- Table to track wallet connections
CREATE TABLE IF NOT EXISTS wallet_connections (
    id SERIAL PRIMARY KEY,
    wallet_address VARCHAR(50) NOT NULL,
    wallet_type VARCHAR(50), -- phantom, solflare, etc
    connection_type VARCHAR(20) DEFAULT 'connect', -- connect, disconnect, reconnect
    visitor_id VARCHAR(255),
    session_id VARCHAR(255),
    page_path VARCHAR(500),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Connection context
    is_first_time BOOLEAN DEFAULT FALSE,
    connection_duration INTEGER -- in seconds (for disconnects)
);

-- Table to track user sessions
CREATE TABLE IF NOT EXISTS user_sessions (
    id SERIAL PRIMARY KEY,
    session_id VARCHAR(255) UNIQUE NOT NULL,
    visitor_id VARCHAR(255),
    wallet_address VARCHAR(50),
    
    -- Session timing
    start_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    end_time TIMESTAMP WITH TIME ZONE,
    duration INTEGER, -- in seconds
    
    -- Session context
    entry_page VARCHAR(500),
    exit_page VARCHAR(500),
    page_count INTEGER DEFAULT 1,
    is_mobile BOOLEAN DEFAULT FALSE,
    user_agent TEXT,
    referrer VARCHAR(500),
    
    -- Engagement metrics
    scroll_depth INTEGER DEFAULT 0, -- percentage
    clicks_count INTEGER DEFAULT 0,
    time_on_site INTEGER DEFAULT 0 -- in seconds
);

-- Create indexes after table creation
CREATE INDEX IF NOT EXISTS idx_page_views_timestamp ON page_views(timestamp);
CREATE INDEX IF NOT EXISTS idx_page_views_page_path ON page_views(page_path);
CREATE INDEX IF NOT EXISTS idx_page_views_visitor ON page_views(visitor_id);
CREATE INDEX IF NOT EXISTS idx_page_views_session ON page_views(session_id);

CREATE INDEX IF NOT EXISTS idx_wallet_connections_address ON wallet_connections(wallet_address);
CREATE INDEX IF NOT EXISTS idx_wallet_connections_timestamp ON wallet_connections(timestamp);
CREATE INDEX IF NOT EXISTS idx_wallet_connections_type ON wallet_connections(connection_type);
CREATE INDEX IF NOT EXISTS idx_wallet_connections_visitor ON wallet_connections(visitor_id);

CREATE INDEX IF NOT EXISTS idx_user_sessions_session_id ON user_sessions(session_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_visitor ON user_sessions(visitor_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_wallet ON user_sessions(wallet_address);
CREATE INDEX IF NOT EXISTS idx_user_sessions_start_time ON user_sessions(start_time);

-- Enable Row Level Security
ALTER TABLE page_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallet_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access (for analytics) - only if they don't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'page_views' AND policyname = 'Allow public read access on page_views') THEN
        CREATE POLICY "Allow public read access on page_views" ON page_views FOR SELECT USING (true);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'page_views' AND policyname = 'Allow public insert on page_views') THEN
        CREATE POLICY "Allow public insert on page_views" ON page_views FOR INSERT WITH CHECK (true);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'wallet_connections' AND policyname = 'Allow public read access on wallet_connections') THEN
        CREATE POLICY "Allow public read access on wallet_connections" ON wallet_connections FOR SELECT USING (true);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'wallet_connections' AND policyname = 'Allow public insert on wallet_connections') THEN
        CREATE POLICY "Allow public insert on wallet_connections" ON wallet_connections FOR INSERT WITH CHECK (true);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_sessions' AND policyname = 'Allow public read access on user_sessions') THEN
        CREATE POLICY "Allow public read access on user_sessions" ON user_sessions FOR SELECT USING (true);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_sessions' AND policyname = 'Allow public insert on user_sessions') THEN
        CREATE POLICY "Allow public insert on user_sessions" ON user_sessions FOR INSERT WITH CHECK (true);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_sessions' AND policyname = 'Allow public update on user_sessions') THEN
        CREATE POLICY "Allow public update on user_sessions" ON user_sessions FOR UPDATE USING (true);
    END IF;
END $$;

-- Function to clean old analytics data (optional - run monthly)
CREATE OR REPLACE FUNCTION cleanup_old_analytics()
RETURNS void AS $$
BEGIN
    -- Keep only last 6 months of data
    DELETE FROM page_views WHERE timestamp < NOW() - INTERVAL '6 months';
    DELETE FROM wallet_connections WHERE timestamp < NOW() - INTERVAL '6 months';
    DELETE FROM user_sessions WHERE start_time < NOW() - INTERVAL '6 months';
END;
$$ LANGUAGE plpgsql;

-- Optional: Create a scheduled job to run cleanup (requires pg_cron extension)
-- SELECT cron.schedule('cleanup-analytics', '0 2 1 * *', 'SELECT cleanup_old_analytics();');

-- Create view for easy analytics querying
CREATE OR REPLACE VIEW analytics_summary AS
SELECT 
    'page_views' as metric,
    COUNT(*) as total_count,
    COUNT(DISTINCT visitor_id) as unique_visitors,
    DATE_TRUNC('day', timestamp) as date
FROM page_views 
GROUP BY DATE_TRUNC('day', timestamp)
UNION ALL
SELECT 
    'wallet_connections' as metric,
    COUNT(*) as total_count,
    COUNT(DISTINCT wallet_address) as unique_visitors,
    DATE_TRUNC('day', timestamp) as date
FROM wallet_connections 
WHERE connection_type = 'connect'
GROUP BY DATE_TRUNC('day', timestamp)
UNION ALL
SELECT 
    'active_sessions' as metric,
    COUNT(*) as total_count,
    COUNT(DISTINCT visitor_id) as unique_visitors,
    DATE_TRUNC('day', start_time) as date
FROM user_sessions 
GROUP BY DATE_TRUNC('day', start_time)
ORDER BY date DESC;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon;
GRANT SELECT, INSERT ON page_views TO anon;
GRANT SELECT, INSERT ON wallet_connections TO anon;
GRANT SELECT, INSERT, UPDATE ON user_sessions TO anon;
GRANT SELECT ON analytics_summary TO anon;
