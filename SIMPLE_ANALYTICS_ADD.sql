-- Simple Analytics Enhancement - Safe to run on existing database
-- This version avoids conflicts with existing triggers and policies

-- Table to track page views
CREATE TABLE IF NOT EXISTS page_views (
    id SERIAL PRIMARY KEY,
    visitor_id VARCHAR(255),
    page_path VARCHAR(500) NOT NULL,
    user_agent TEXT,
    referrer VARCHAR(500),
    session_id VARCHAR(255),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    load_time INTEGER,
    wallet_address VARCHAR(50),
    is_mobile BOOLEAN DEFAULT FALSE
);

-- Table to track wallet connections
CREATE TABLE IF NOT EXISTS wallet_connections (
    id SERIAL PRIMARY KEY,
    wallet_address VARCHAR(50) NOT NULL,
    wallet_type VARCHAR(50),
    connection_type VARCHAR(20) DEFAULT 'connect',
    visitor_id VARCHAR(255),
    session_id VARCHAR(255),
    page_path VARCHAR(500),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_first_time BOOLEAN DEFAULT FALSE,
    connection_duration INTEGER
);

-- Table to track user sessions
CREATE TABLE IF NOT EXISTS user_sessions (
    id SERIAL PRIMARY KEY,
    session_id VARCHAR(255) UNIQUE NOT NULL,
    visitor_id VARCHAR(255),
    wallet_address VARCHAR(50),
    start_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    end_time TIMESTAMP WITH TIME ZONE,
    duration INTEGER,
    entry_page VARCHAR(500),
    exit_page VARCHAR(500),
    page_count INTEGER DEFAULT 1,
    is_mobile BOOLEAN DEFAULT FALSE,
    user_agent TEXT,
    referrer VARCHAR(500),
    scroll_depth INTEGER DEFAULT 0,
    clicks_count INTEGER DEFAULT 0,
    time_on_site INTEGER DEFAULT 0
);

-- Create indexes safely
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

-- Grant permissions safely
DO $$
BEGIN
    -- Grant permissions, ignore if they already exist
    BEGIN
        GRANT SELECT, INSERT ON page_views TO anon;
        GRANT SELECT, INSERT ON wallet_connections TO anon;
        GRANT SELECT, INSERT, UPDATE ON user_sessions TO anon;
    EXCEPTION WHEN OTHERS THEN
        -- Ignore errors if permissions already granted
        NULL;
    END;
END $$;

-- Create analytics view
DROP VIEW IF EXISTS analytics_summary;
CREATE VIEW analytics_summary AS
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

-- Grant view access
GRANT SELECT ON analytics_summary TO anon;

-- Create cleanup function
CREATE OR REPLACE FUNCTION cleanup_old_analytics()
RETURNS void AS $$
BEGIN
    DELETE FROM page_views WHERE timestamp < NOW() - INTERVAL '6 months';
    DELETE FROM wallet_connections WHERE timestamp < NOW() - INTERVAL '6 months';
    DELETE FROM user_sessions WHERE start_time < NOW() - INTERVAL '6 months';
END;
$$ LANGUAGE plpgsql;
