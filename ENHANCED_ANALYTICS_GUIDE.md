# Enhanced Analytics Setup Guide

## Step 1: Update Supabase Database Schema

1. Go to your Supabase dashboard: https://supabase.com/dashboard
2. Navigate to your project: `szbtpvifxbeztihkijgk`
3. Click on "SQL Editor" in the left sidebar
4. Copy and paste the contents of `ANALYTICS_ENHANCEMENT.sql` into the editor
5. Click "Run" to execute the SQL commands

This will create the new tables:
- `page_views` - Tracks every page visit
- `wallet_connections` - Tracks wallet connect/disconnect events
- `user_sessions` - Tracks user session data and engagement

## Step 2: Verify Tables Were Created

After running the SQL, go to "Table Editor" and you should see the new tables listed.

## Step 3: Test the Analytics

The analytics are now automatically active! Every page visit and wallet connection will be tracked.

### What Gets Tracked Automatically:

1. **Page Views**: Every time someone visits any page on your site
2. **Wallet Connections**: When users connect/disconnect their wallets
3. **User Sessions**: Session duration, page count, engagement metrics
4. **Swap Transactions**: Already working from your existing system

### View Analytics Data:

1. Go to your admin dashboard: `/admin`
2. Click "View Analytics" to see all the data
3. Or query directly in Supabase Table Editor

## Step 4: Monitor Your Growth

You can now track:
- ✅ Daily/Weekly/Monthly website visits
- ✅ Unique visitors vs returning users
- ✅ Wallet connection rates
- ✅ User engagement (time on site, pages per session)
- ✅ Trading volume and swap counts
- ✅ Growth trends over time

## Database Schema Overview

```sql
-- New tables added:
page_views       -> Tracks every page visit
wallet_connections -> Tracks wallet events  
user_sessions    -> Tracks user engagement
analytics_summary -> Easy view for reporting

-- Existing tables (still working):
swaps           -> Transaction records
platform_stats  -> Daily summaries
```

## Troubleshooting

If analytics aren't showing up:
1. Check that the SQL was executed successfully
2. Verify your environment variables are set correctly
3. Check browser console for any errors
4. Test by visiting different pages and connecting/disconnecting wallet

The system is designed to be robust and will continue working even if some tracking fails.
