// src/lib/analytics.ts
import { supabase, isAnalyticsEnabled } from './supabase';

export interface PageView {
  visitor_id?: string;
  page_path: string;
  user_agent?: string;
  referrer?: string;
  session_id: string;
  wallet_address?: string;
  is_mobile?: boolean;
  load_time?: number;
}

export interface WalletConnection {
  wallet_address: string;
  wallet_type?: string; // 'phantom', 'solflare', etc.
  connection_type?: string;
  visitor_id?: string;
  session_id: string;
  page_path?: string;
  is_first_time?: boolean;
  connection_duration?: number;
}

export interface UserSession {
  session_id: string;
  visitor_id?: string;
  wallet_address?: string;
  start_time?: string;
  last_activity?: string;
  end_time?: string;
  duration?: number;
  entry_page?: string;
  exit_page?: string;
  page_count?: number;
  is_mobile?: boolean;
  user_agent?: string;
  referrer?: string;
  scroll_depth?: number;
  clicks_count?: number;
  time_on_site?: number;
}

// Generate session ID
export const generateSessionId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

// Get or create session ID
export const getSessionId = (): string => {
  if (typeof window === 'undefined') return generateSessionId();
  
  let sessionId = sessionStorage.getItem('frenzy_session_id');
  if (!sessionId) {
    sessionId = generateSessionId();
    sessionStorage.setItem('frenzy_session_id', sessionId);
  }
  return sessionId;
};

// Track page view
export const trackPageView = async (pagePath: string, walletAddress?: string) => {
  if (!isAnalyticsEnabled()) return;

  try {
    const sessionId = getSessionId();
    const pageView: PageView = {
      visitor_id: sessionId, // Use session as visitor ID for now
      page_path: pagePath,
      user_agent: typeof window !== 'undefined' ? navigator.userAgent : undefined,
      referrer: typeof window !== 'undefined' ? document.referrer || undefined : undefined,
      session_id: sessionId,
      wallet_address: walletAddress,
      is_mobile: typeof window !== 'undefined' ? /Mobile|Android|iPhone/i.test(navigator.userAgent) : false
    };

    await supabase!
      .from('page_views')
      .insert([pageView]);

    // Update session
    await updateSession(sessionId, walletAddress);
  } catch (error) {
    console.error('Failed to track page view:', error);
  }
};

// Track wallet connection
export const trackWalletConnection = async (
  walletAddress: string, 
  walletType: string,
  isFirstConnection: boolean = false
) => {
  if (!isAnalyticsEnabled()) return;

  try {
    const sessionId = getSessionId();
    const connection: WalletConnection = {
      wallet_address: walletAddress,
      wallet_type: walletType,
      connection_type: 'connect',
      visitor_id: sessionId,
      session_id: sessionId,
      page_path: typeof window !== 'undefined' ? window.location.pathname : undefined,
      is_first_time: isFirstConnection
    };

    await supabase!
      .from('wallet_connections')
      .insert([connection]);

    // Update session with wallet
    await updateSession(sessionId, walletAddress);
  } catch (error) {
    console.error('Failed to track wallet connection:', error);
  }
};

// Update session data
const updateSession = async (sessionId: string, walletAddress?: string) => {
  if (!isAnalyticsEnabled()) return;

  try {
    // Check if session exists
    const { data: existingSession } = await supabase!
      .from('user_sessions')
      .select('*')
      .eq('session_id', sessionId)
      .single();

    if (existingSession) {
      // Update existing session
      await supabase!
        .from('user_sessions')
        .update({
          wallet_address: walletAddress || existingSession.wallet_address,
          page_count: (existingSession.page_count || 0) + 1,
          last_activity: new Date().toISOString()
        })
        .eq('session_id', sessionId);
    } else {
      // Create new session
      const newSession: UserSession = {
        session_id: sessionId,
        visitor_id: sessionId,
        wallet_address: walletAddress,
        page_count: 1,
        time_on_site: 0,
        start_time: new Date().toISOString(),
        last_activity: new Date().toISOString(),
        entry_page: typeof window !== 'undefined' ? window.location.pathname : undefined,
        is_mobile: typeof window !== 'undefined' ? /Mobile|Android|iPhone/i.test(navigator.userAgent) : false,
        user_agent: typeof window !== 'undefined' ? navigator.userAgent : undefined,
        referrer: typeof window !== 'undefined' ? document.referrer || undefined : undefined
      };

      await supabase!
        .from('user_sessions')
        .insert([newSession]);
    }
  } catch (error) {
    console.error('Failed to update session:', error);
  }
};

// Track time spent on page
export const trackTimeSpent = (startTime: number) => {
  return async () => {
    if (!isAnalyticsEnabled()) return;
    
    const timeSpent = Math.floor((Date.now() - startTime) / 1000);
    const sessionId = getSessionId();
    
    try {
      // Update session time
      await supabase!
        .from('user_sessions')
        .update({
          time_on_site: timeSpent,
          last_activity: new Date().toISOString()
        })
        .eq('session_id', sessionId);
      
      console.log(`Time tracked: ${timeSpent}s`);
    } catch (error) {
      console.error('Failed to track time:', error);
    }
  };
};

// Utility: Get visitor stats
export const getVisitorStats = async (timeframe: '24h' | '7d' | '30d' = '24h') => {
  if (!isAnalyticsEnabled()) return null;

  try {
    let dateFilter = new Date();
    switch (timeframe) {
      case '24h':
        dateFilter.setDate(dateFilter.getDate() - 1);
        break;
      case '7d':
        dateFilter.setDate(dateFilter.getDate() - 7);
        break;
      case '30d':
        dateFilter.setDate(dateFilter.getDate() - 30);
        break;
    }

    const { data: pageViews } = await supabase!
      .from('page_views')
      .select('*')
      .gte('timestamp', dateFilter.toISOString());

    const { data: connections } = await supabase!
      .from('wallet_connections')
      .select('*')
      .gte('timestamp', dateFilter.toISOString());

    const { data: sessions } = await supabase!
      .from('user_sessions')
      .select('*')
      .gte('start_time', dateFilter.toISOString());

    return {
      totalPageViews: pageViews?.length || 0,
      uniqueVisitors: new Set(sessions?.map(s => s.session_id)).size,
      walletConnections: connections?.length || 0,
      uniqueWallets: new Set(connections?.map(c => c.wallet_address)).size,
      averageTimeSpent: sessions?.reduce((acc, s) => acc + (s.time_on_site || 0), 0) / (sessions?.length || 1)
    };
  } catch (error) {
    console.error('Failed to get visitor stats:', error);
    return null;
  }
};
