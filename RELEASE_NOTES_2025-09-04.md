# Release Notes — 2025-09-04

These notes summarize the changes shipped on September 4, 2025, and how to verify them.

## Highlights
- SEO/social: Default Open Graph/Twitter image switched to `/assets/logos/frenzy-logo.jpg` (Telegram-friendly) with SVG fallback.
- Push notifications: End-to-end subscribe/unsubscribe stabilized; graceful 200 responses when disabled.
- Service Worker: Restricted to same-origin GET to avoid intercepting Supabase; push handlers retained.
- 2FA (TOTP): Start/verify/disable API and UI card with QR code.
- Gamification: Points/streaks/badges/referrals; leaderboard tabs (Points/Volume/Streak) with privacy filtering; PnL (FIFO) and cache.
- API hardening: Health checks and defensive responses to prevent noisy 400s.
- Docs: README refreshed with new features, SEO defaults, and quick start/deploy notes.

## Code Touchpoints
- Metadata: `src/app/layout.tsx` (Open Graph/Twitter image now `/assets/logos/frenzy-logo.jpg`).
- Service worker: `public/sw.js` retains push handlers; network strategy constrained.
- Push: `/api/push/subscribe`, `/api/push/unsubscribe` and Settings toggle component.
- Security: `/api/2fa` and `src/components/settings/TwoFactorCard.tsx`.
- Gamification: `src/lib/gamification.ts`, `src/lib/badges.ts`, `src/lib/pnl.ts`, `src/lib/referrals.ts`; Leaderboard UI.

## Database & Config
- Supabase: Apply `GAMIFICATION_PNL_SCHEMA.sql`, `SECURITY_AND_JOBS.sql`. Optional: `SIMPLE_ANALYTICS_ADD.sql`, `USD_ANALYTICS_FIX.md`.
- Env: Ensure VAPID keys for push; SUPABASE_SERVICE_KEY for server writes.

## Behavior Changes
- Telegram previews now use a JPG; if you still see the old image, add a cache-buster (e.g., `?v=2`) when sharing.
- Leaderboard hides private profiles by default.

## Verification Checklist
- SEO/social
  - View page source or use any OG debugger to confirm `og:image` → `/assets/logos/frenzy-logo.jpg`.
  - Share `https://www.frenzyswap.com/?v=2` in Telegram to confirm preview.
- Push
  - Toggle notifications in Settings; ensure subscribe/unsubscribe completes without 400s.
- 2FA
  - Enroll, verify, and disable; QR renders; codes accepted.
- Gamification
  - Perform a test swap; points/streak update and appear on Leaderboard.
- Service Worker
  - Supabase requests succeed; no ERR_CONNECTION_CLOSED in console.

## Rollback
- Revert `src/app/layout.tsx` image entries to the previous `/assets/frenzy-desktop.png` if needed.
- Disable notifications by removing VAPID env or returning early in push APIs.

---
For deeper details, see `README.md` and `GAMIFICATION_README.md`.