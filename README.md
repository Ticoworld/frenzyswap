# FrenzySwap

Premier Solana DEX Aggregator for meme tokens, powered by Jupiter routing. Includes gamified analytics (points, streaks, badges, referrals), push notifications, and privacy-first leaderboards.

## What’s New (Sep 2025)
[Release Notes — 2025-09-04](./RELEASE_NOTES_2025-09-04.md)

- Gamification: points ledger, daily streaks, badge awards, referrals, and PnL caching.
- Leaderboards: Top Points / Volume / Streak with privacy filtering (private profiles hidden by default).
- Notifications: Web Push subscribe/unsubscribe endpoints and UI, graceful fallback if disabled.
- Security: 2FA (TOTP) flows, hardened APIs, and Supabase health check.
- SEO: Open Graph and Twitter images now default to `/assets/logos/frenzy-logo.jpg` for better Telegram previews, with SVG logomark fallback.

## Features

### 🔄 Swap
- Jupiter-powered aggregation with optimal routing and slippage controls.
- Multi-wallet support (Phantom, Solflare, etc.).

### 📊 Analytics
- Real-time platform stats and swap tracking.
- Founder/admin dashboards and public stats on landing.

### 🏆 Gamification & Rewards
- Points: awarded for verified swaps and milestones with velocity caps and fraud checks.
- Streaks: daily activity increases streak count; miss a day to reset.
- Badges: evaluated and awarded based on swaps/streaks thresholds.
- Referrals: auto-verifies when a referee completes their first swap—no manual claims.
- PnL: FIFO-based realized PnL with cached summaries.

### 🔔 Notifications
- Web Push (subscribe/unsubscribe) with service worker handlers.
- Graceful degrade to 200 with `skipped: true` when backend is disabled.

### 🔐 Privacy & Security
- Wallet/RLS-gated analytics; user profile privacy toggle respected in leaderboards.
- 2FA (TOTP) enrollment, verify, and disable flows.

### 🎨 UX
- Responsive Tailwind UI, skeletons, animations, and mobile quick nav.

## Quick Start

1) Install
```bash
npm install
```

2) Env
Create `.env.local` with at least:
```bash
NEXT_PUBLIC_SITE_URL=https://www.frenzyswap.com
NEXT_PUBLIC_RPC_URL=https://api.mainnet-beta.solana.com
NEXT_PUBLIC_ADMIN_WALLETS=wallet1,wallet2
NEXT_PUBLIC_ANALYTICS_AUTHORIZED_WALLETS=walletA,walletB
SUPABASE_URL=... 
SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_KEY=... # server only
VAPID_PUBLIC_KEY=...
VAPID_PRIVATE_KEY=...
```

3) Database (Supabase)
- Run `GAMIFICATION_PNL_SCHEMA.sql`, then `SECURITY_AND_JOBS.sql`.
- Optionally run `SIMPLE_ANALYTICS_ADD.sql` and `USD_ANALYTICS_FIX.md` adjustments if applicable.
- Migrations folder includes incremental updates under `migrations/`.

4) Dev
```bash
npm run dev
```

## Deployment
- Build with `npm run build` and deploy (Vercel recommended).
- Ensure env vars are set; see above.

## SEO
- Open Graph and Twitter metadata are defined in `src/app/layout.tsx`.
- Default preview image: `/assets/logos/frenzy-logo.jpg` (JPG for Telegram). Fallback: `/frenzyswap_logomark.svg`.
- `public/robots.txt` and `public/security.txt` are included.

## API and Libraries
- Supabase client/admin with RLS policies.
- Gamification helpers: `src/lib/gamification.ts`, `src/lib/badges.ts`, `src/lib/pnl.ts`.
- Referrals: `src/lib/referrals.ts` with auto-verification on first swap.
- Push: `src/app/api/push/subscribe|unsubscribe` and service worker `public/sw.js`.

## Security Notes
- RLS across analytics tables; admin writes via `SUPABASE_SERVICE_KEY` server-side only.
- 2FA flows at `/api/2fa` with QR generation.

## License
MIT

## Support
Open an issue or check the docs in this repository (setup, analytics, SEO, security guides).
