# Gamified Analytics & P&L (Scaffold)

This adds foundation for a user progression system with points, streaks, referrals, events, and P&L.

What’s included:
- SQL schema: `GAMIFICATION_PNL_SCHEMA.sql` to run in Supabase
- Libs: `src/lib/gamification.ts`, `src/lib/pnl.ts`
- APIs: `/api/pnl`, `/api/leaderboard`, `/api/points`
- UI stubs: `(dapp)/leaderboard`, `(dapp)/profile`
- Integration: points, streaks, event log, P&L cache update inside `/api/log-swap`

Notes:
- P&L uses FIFO on USD notionals from `swap_records` (`from_usd_value`/`to_usd_value`). Improve later with historical prices per mint if missing.
- Points policy is simple: base per swap + per USD of volume + daily streak.
- Leaderboards query live data; can switch to materialized/cached views when volume grows.

Security:
- RLS enabled. Public read of aggregates, inserts allowed for now; for production, restrict inserts to service role via edge function or server key.
- Wallet scoping for per-user queries (client calls `/api/pnl?wallet=` their address). For sensitive data, add token-based auth via `src/lib/auth.ts`.

Next steps:
- Add referral verification flow and referral points.
- Add badges model and award rules.
- Backfill historical P&L by fetching missing USD values via on-chain oracles.