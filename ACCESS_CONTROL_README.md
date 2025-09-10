Access control and referrals (2025-09-09)


- DB whitelist: table access_whitelist is the source of truth. Only wallets present here can access protected routes.
- ENV bootstrap: NEXT_PUBLIC_ALLOWED_WALLETS is used only to auto-add a wallet to DB on first visit.
- Referrals: Each user has a single referral link: `/login?ref=<wallet>`. When a new user joins with this link, they are auto-whitelisted, a referral is logged, and the inviter is awarded points. No invite tokens are used. For legacy links that used `?invite=`, the value is treated as the referrer wallet.
- Middleware: uses hasAccessOrOnboard(wallet, ref) to grant access, migrate env, or redirect to login/waitlist.
- Login page: calls /api/access to resolve access and sets the connected-wallet cookie for middleware.
API quick reference
- POST /api/referrals
	- { referrer } → { success, link, code }
	- { referrer, referee } → { success, referral: { id, referrer, referee, status } }
- GET /api/users?scope=all|invited|active|waitlisted&limit=&offset=
	- Returns { data: [{ wallet, joinType, status, createdAt, lastActive }], total }
- GET /api/analytics?period=daily|weekly|monthly|yearly
	- Returns { data: { since, totalUsers, invitedUsers, activeUsers, farmedInvites, totalReferrals, totalSwaps, totalSessions, totalPointsEvents } }


Edge cases
- Idempotent upserts into access_whitelist to avoid duplicates.
- Referral onboarding is atomic and idempotent; double-adds are prevented.


Implementation notes
- Unified access orchestration: DB whitelist → ENV bootstrap → referral link → waitlist.
- Middleware preserves `ref`, `invite`, and `returnTo` query params when redirecting to `/login`.
- Idempotent upserts and unique constraints keep onboarding atomic.


Invite Friends (UI)
- In Settings, share your referral link (`/login?ref=<your-wallet>`). Anyone who joins with this link is auto-whitelisted and you earn points for each verified referral.
- The UI provides a copy button and shows referral stats (verified/total). No invite tokens or separate invite links exist.
