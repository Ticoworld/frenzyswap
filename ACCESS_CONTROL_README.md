Access control and referrals (2025-09-08)

- DB whitelist: table access_whitelist is the source of truth. Only wallets present here can access protected routes.
- ENV bootstrap: NEXT_PUBLIC_ALLOWED_WALLETS is used only to auto-add a wallet to DB on first visit.
- Invites: invite_tokens support secure referral links. Accepting a valid token auto-whitelists the invitee and logs invite_acceptances. A referral row is also created/kept pending for later verification points on first swap.
- Middleware: uses hasAccessOrOnboard(wallet, token) to grant access, migrate env, or redirect to login/waitlist.
- Login page: calls /api/access to resolve access and sets the connected-wallet cookie for middleware.

Edge cases
- Idempotent upserts into access_whitelist to avoid duplicates.
- Token exhaustion and expiry are enforced. A Postgres RPC increment_invite_use can be added for atomic increments; a fallback update is used if RPC is absent.

Testing
- .env whitelist only
- referral invite path with token
- non-invited waitlist path
- repeat visits rely solely on DB whitelist

Invite Friends (UI)
- In Settings, use the Invite Friends card to create a token-backed link.
- Share link (/login?invite=<token>). When the invitee connects with this link, they are auto-whitelisted and you gain points.
- You can copy the link via the Copy button. Errors are surfaced inline and via toasts.
