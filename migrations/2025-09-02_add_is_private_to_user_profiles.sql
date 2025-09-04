-- Add is_private column to user_profiles for privacy toggle
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS is_private BOOLEAN DEFAULT FALSE;

-- Optionally backfill existing profiles to default to public
UPDATE user_profiles SET is_private = FALSE WHERE is_private IS NULL;
