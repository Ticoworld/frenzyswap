# FrenzySwap Analytics System

## Overview

FrenzySwap now includes a comprehensive analytics tracking system that monitors all swap activity and provides real-time platform statistics. This system is built with Supabase for data storage and provides both public statistics and detailed admin analytics.

## Features

- **Real-time Swap Tracking**: Every swap transaction is automatically logged with detailed metadata
- **Platform Statistics**: Live aggregated stats including volume, swap count, earnings, and unique users
- **Admin Dashboard**: Detailed analytics interface for monitoring platform performance
- **Public Stats Display**: Beautiful statistics component for the landing page
- **Automatic Aggregation**: Background updates ensure stats are always current

## Database Schema

### Swap Records Table (`swap_records`)
Stores detailed information about each swap transaction:

- `id`: Unique identifier (UUID)
- `wallet_address`: User's wallet address
- `from_token` / `to_token`: Token symbols being swapped
- `from_amount` / `to_amount`: Token amounts
- `from_usd_value` / `to_usd_value`: USD values (estimated)
- `fees_paid` / `fees_usd_value`: Transaction fees
- `signature`: Solana transaction signature
- `block_time`: Blockchain timestamp
- `jupiter_fee` / `platform_fee`: Fee breakdown
- `meme_burned`: Amount of MEME tokens burned
- `slippage`: Slippage percentage
- `route_plan`: Jupiter route information
- `created_at`: Record creation timestamp

### Platform Stats Table (`platform_stats`)
Cached aggregated statistics for fast retrieval:

- `total_volume_usd`: Total trading volume in USD
- `total_swaps`: Total number of swaps
- `total_earnings_usd`: Total platform earnings
- `total_meme_burned`: Total MEME tokens burned
- `unique_wallets`: Number of unique users
- `last_updated`: Last statistics update time

## API Endpoints

### `/api/log-swap` (POST)
Logs a new swap transaction to the database.

**Request Body:**
```json
{
  "walletAddress": "string",
  "fromToken": "string",
  "toToken": "string",
  "fromAmount": "number",
  "toAmount": "number",
  "fromUsdValue": "number",
  "toUsdValue": "number",
  "feesPaid": "number",
  "feesUsdValue": "number",
  "signature": "string",
  "blockTime": "number",
  "jupiterFee": "number",
  "platformFee": "number",
  "memeBurned": "number",
  "slippage": "number",
  "routePlan": "string"
}
```

### `/api/stats` (GET)
Returns current platform statistics.

**Response:**
```json
{
  "totalVolume": "$1,234,567.89",
  "totalSwaps": "12,345",
  "totalEarnings": "$12,345.67",
  "memeBurned": "123,456",
  "uniqueWallets": "1,234",
  "lastUpdated": "2024-01-01T12:00:00Z"
}
```

### `/api/swaps` (GET)
Returns paginated swap records for the admin dashboard.

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Records per page (default: 20)

## Components

### `PlatformStats`
Displays real-time platform statistics with beautiful animations.

**Props:**
- `showTitle`: Show/hide the section title (default: true)
- `compact`: Use compact layout (default: false)
- `className`: Additional CSS classes

**Usage:**
```jsx
<PlatformStats className="py-12 px-4 max-w-7xl mx-auto" />
```

### Analytics Dashboard (`/analytics`)
Comprehensive admin dashboard showing:
- Live platform statistics
- Detailed swap records table
- Pagination for large datasets
- Transaction signature links to Solscan
- Real-time refresh capabilities

## Setup Instructions

### 1. Supabase Configuration

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Run the SQL schema from `supabase-schema.sql` in your Supabase SQL Editor
3. Add your Supabase credentials to `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

### 2. Access Control Setup

Configure wallet addresses that can access analytics:

```env
# Main admin wallets (for all admin features)
NEXT_PUBLIC_ADMIN_WALLETS=founder_wallet,dev_wallet

# Analytics-specific access (optional, falls back to admin wallets)
NEXT_PUBLIC_ANALYTICS_AUTHORIZED_WALLETS=founder_wallet,analytics_team_wallet
```

### 3. Database Schema Setup

Execute the provided SQL schema in your Supabase SQL Editor:

```sql
-- Run the complete schema from supabase-schema.sql
-- This creates tables, indexes, functions, and triggers
```

### 4. Access Analytics

**For Founders/Developers:**
- Visit `/admin` for the admin dashboard
- Visit `/analytics` directly for detailed analytics
- Access is restricted to authorized wallet addresses only

**For Public:**
- Platform statistics are displayed on the landing page
- No access to detailed analytics or admin features

### 5. Testing the System

1. Test the analytics system:
   ```bash
   curl -X POST http://localhost:3000/api/test-analytics
   ```

2. Verify the admin dashboard at `/admin`
3. Check analytics access at `/analytics`
4. Perform a test swap to see real-time logging

## Integration

### Swap Form Integration

The analytics system is automatically integrated into the swap form. After each successful swap, the system:

1. Logs the transaction details to Supabase
2. Updates platform statistics in the background
3. Handles errors gracefully without affecting the swap UX

### Landing Page Integration

Platform statistics are displayed on the landing page between the Value Props and How It Works sections, providing visitors with real-time platform metrics.

## Performance Considerations

- **Automatic Aggregation**: Statistics are updated via database triggers
- **Caching**: Platform stats are cached for fast retrieval
- **Background Processing**: Swap logging happens asynchronously
- **Error Handling**: Graceful fallbacks prevent analytics issues from affecting swaps
- **Indexing**: Optimized database indexes for fast queries

## Security

- **Row Level Security (RLS)**: Enabled on all tables
- **Public Read Access**: Stats and swap records are publicly readable
- **Controlled Write Access**: Only authenticated requests can insert records
- **Data Validation**: All inputs are validated before database insertion

## Monitoring

The system includes comprehensive error logging and monitoring:
- Failed swap logs are logged to console
- Database errors are handled gracefully
- API endpoints return proper HTTP status codes
- Real-time statistics validation

## Future Enhancements

Potential improvements for the analytics system:

1. **Advanced Filtering**: Date ranges, token filters, wallet filters
2. **Charts and Graphs**: Visual representation of trends and data
3. **Export Functionality**: CSV/JSON export of analytics data
4. **Real-time Updates**: WebSocket integration for live updates
5. **Custom Dashboards**: User-specific analytics views
6. **Performance Metrics**: Swap success rates, average fees, etc.
7. **Integration Metrics**: Jupiter performance, route optimization data

## Troubleshooting

### Common Issues

1. **Missing Environment Variables**: Ensure Supabase credentials are properly set
2. **Database Connection**: Verify Supabase project URL and API key
3. **Table Not Found**: Run the complete schema creation script
4. **Permission Errors**: Check RLS policies and table permissions

### Debug Mode

Enable additional logging by setting:
```env
NODE_ENV=development
```

This will provide detailed console logs for debugging analytics issues.

## Support

For issues with the analytics system:
1. Check the browser console for JavaScript errors
2. Verify Supabase connection and permissions
3. Ensure all environment variables are properly configured
4. Check the `/api/stats` endpoint directly for API issues
