# FrenzySwap

A decentralized exchange (DEX) built on Solana with Jupiter aggregation, featuring comprehensive analytics and MEME token utilities.

## Features

### 🔄 **Swap Functionality**
- Jupiter-powered token swapping with optimal routing
- Real-time price quotes and slippage protection
- MEME token burning mechanism
- Multi-wallet support (Phantom, Solflare, etc.)

### 📊 **Analytics System**
- Real-time platform statistics (volume, swaps, earnings)
- Comprehensive swap tracking and logging
- Founder/developer dashboard for detailed insights
- Public statistics display on landing page

### 🛡️ **Access Control**
- Private beta with wallet-based access control
- Admin dashboard for authorized users only
- Secure analytics access for founders and developers

### 🎨 **User Experience**
- Beautiful, responsive UI with Tailwind CSS
- Loading skeletons and smooth animations
- Mobile-optimized design
- Real-time balance updates

## Quick Start

### 1. Clone and Install
```bash
git clone https://github.com/your-username/frenzyswap.git
cd frenzyswap
npm install
```

### 2. Environment Setup
```bash
cp .env.example .env.local
# Edit .env.local with your configuration
```

### 3. Configure Supabase (for Analytics)
1. Create a Supabase project at [supabase.com](https://supabase.com)
2. Run the SQL from `supabase-schema.sql`
3. Add your credentials to `.env.local`

### 4. Run Development Server
```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see the application.

## Documentation

- **[Analytics Setup Guide](./ANALYTICS_SETUP.md)** - Complete analytics system setup
- **[Wallet Submission Guide](./WALLET_SUBMISSION_GUIDE.md)** - Beta access instructions
- **[Setup Checklist](./SETUP_CHECKLIST.md)** - Pre-launch preparation

## Architecture

### Frontend
- **Next.js 13+** with App Router
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **Framer Motion** for animations
- **Solana Wallet Adapter** for wallet integration

### Backend & Data
- **Supabase** for analytics database
- **Jupiter API** for swap aggregation
- **Solana Web3.js** for blockchain interaction

### Key Components
- `SwapForm` - Main trading interface
- `PlatformStats` - Real-time statistics display
- `Analytics Dashboard` - Admin-only detailed analytics
- `TokenSelector` - Enhanced token search with contract address support

## Environment Variables

```env
# Supabase (Required for Analytics)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Access Control
NEXT_PUBLIC_ALLOWED_WALLETS=wallet1,wallet2,wallet3
NEXT_PUBLIC_ADMIN_WALLETS=founder_wallet,dev_wallet
NEXT_PUBLIC_ANALYTICS_AUTHORIZED_WALLETS=analytics_team_wallets

# Solana Configuration
NEXT_PUBLIC_RPC_URL=https://api.mainnet-beta.solana.com
NEXT_PUBLIC_REFERRAL_ACCOUNT=your_referral_account
```

## Admin Features

### Access Analytics Dashboard
- Visit `/admin` for the main admin panel
- Visit `/analytics` for detailed swap analytics
- Access restricted to authorized wallet addresses

### Analytics Features
- Real-time platform statistics
- Detailed swap records with pagination
- Transaction links to Solscan
- Export capabilities (coming soon)

## Deployment

### Vercel (Recommended)
```bash
# Deploy to Vercel
vercel --prod
```

### Other Platforms
- Ensure environment variables are properly configured
- Set up Supabase database with the provided schema
- Configure allowed wallet addresses for access control

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## Security

- Row Level Security (RLS) enabled on all database tables
- Wallet-based access control for sensitive features
- Environment variables for secure configuration
- Input validation on all API endpoints

## License

MIT License - see [LICENSE](./LICENSE) for details.

## Support

For technical support or questions:
- Check the documentation files in this repository
- Review the setup guides and troubleshooting sections
- Ensure all environment variables are properly configured
