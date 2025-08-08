-- Add columns to track fee token information
ALTER TABLE swap_records
ADD COLUMN fee_token_symbol TEXT,
ADD COLUMN fee_token_mint TEXT;