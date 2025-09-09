-- 2025-09-09: Drop legacy invite tables now that unified referral links are used
-- Safe to run multiple times; uses IF EXISTS guards

BEGIN;

-- Optionally archive data before dropping (left commented intentionally)
-- CREATE TABLE IF NOT EXISTS invite_tokens_archive AS TABLE invite_tokens WITH NO DATA;
-- INSERT INTO invite_tokens_archive SELECT * FROM invite_tokens;
-- CREATE TABLE IF NOT EXISTS invite_acceptances_archive AS TABLE invite_acceptances WITH NO DATA;
-- INSERT INTO invite_acceptances_archive SELECT * FROM invite_acceptances;

DROP TABLE IF EXISTS invite_acceptances;
DROP TABLE IF EXISTS invite_tokens;

COMMIT;
