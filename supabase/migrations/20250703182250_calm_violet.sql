/*
  # Update Default Balance for Testing

  1. Changes
    - Update default balance for new profiles to $10.00
    - Update existing player accounts to have $10.00 balance
    - Keep restaurant balances unchanged

  2. Purpose
    - Enable testing of tournament functionality
    - Allow players to join multiple tournaments without needing to add funds
*/

-- Update default balance for new profiles
ALTER TABLE profiles ALTER COLUMN balance SET DEFAULT 10.00;

-- Update existing player accounts to have $10.00 balance
UPDATE profiles 
SET balance = 10.00, 
    updated_at = now()
WHERE account_type = 'player';

-- Keep restaurant balances as they are (they earn money from redemptions)
-- No changes needed for restaurant accounts