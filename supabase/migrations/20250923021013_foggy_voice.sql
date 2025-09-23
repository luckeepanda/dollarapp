/*
  # Change Restaurant Account Type to Business

  1. Database Changes
    - Add 'business' to account_type enum
    - Update all existing 'restaurant' records to 'business'
    - Update all functions to use 'business' instead of 'restaurant'
    - Update all table references and constraints

  2. Data Migration
    - Migrate all existing restaurant accounts to business accounts
    - Update all foreign key references
    - Maintain data integrity during transition

  3. Function Updates
    - Update all stored procedures to use 'business' terminology
    - Maintain backward compatibility where possible
    - Update RLS policies to reference 'business' account type
*/

-- Add 'business' to the account_type enum
ALTER TYPE account_type ADD VALUE 'business';

-- Update all existing 'restaurant' records to 'business'
UPDATE profiles 
SET account_type = 'business', 
    updated_at = now() 
WHERE account_type = 'restaurant';

-- Update restaurant_games table to reference business instead of restaurant
-- Rename restaurant_id column to business_id
ALTER TABLE restaurant_games RENAME COLUMN restaurant_id TO business_id;

-- Update foreign key constraint name for clarity
ALTER TABLE restaurant_games DROP CONSTRAINT IF EXISTS restaurant_games_restaurant_id_fkey;
ALTER TABLE restaurant_games ADD CONSTRAINT restaurant_games_business_id_fkey 
  FOREIGN KEY (business_id) REFERENCES profiles(id) ON DELETE CASCADE;

-- Update RLS policies to use 'business' instead of 'restaurant'
DROP POLICY IF EXISTS "Restaurants can manage their own games" ON restaurant_games;
CREATE POLICY "Businesses can manage their own games"
  ON restaurant_games
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.account_type = 'business'
      AND profiles.id = business_id
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.account_type = 'business'
      AND profiles.id = business_id
    )
  );

DROP POLICY IF EXISTS "Restaurants can read completed games for QR redemption" ON restaurant_games;
CREATE POLICY "Businesses can read completed games for QR redemption"
  ON restaurant_games
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.account_type = 'business'
      AND profiles.id = business_id
    )
    AND status = 'completed'
    AND qr_code IS NOT NULL
  );

DROP POLICY IF EXISTS "Public can read restaurant profiles for games" ON profiles;
CREATE POLICY "Public can read business profiles for games"
  ON profiles
  FOR SELECT
  TO public
  USING (account_type = 'business');

DROP POLICY IF EXISTS "Restaurants can read QR codes for redemption" ON player_qr_codes;
CREATE POLICY "Businesses can read QR codes for redemption"
  ON player_qr_codes
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.account_type = 'business'
    )
    AND is_redeemed = false
  );

DROP POLICY IF EXISTS "Restaurants can update QR codes for redemption" ON player_qr_codes;
CREATE POLICY "Businesses can update QR codes for redemption"
  ON player_qr_codes
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.account_type = 'business'
    )
  );

-- Update functions to use 'business' instead of 'restaurant'
CREATE OR REPLACE FUNCTION create_restaurant_game(
  p_business_id uuid,
  p_name text,
  p_description text,
  p_entry_fee decimal,
  p_max_players integer DEFAULT 1,
  p_min_score integer DEFAULT 0,
  p_game_type text DEFAULT 'taco_flyer',
  p_emoji text DEFAULT '🍔'
)
RETURNS uuid AS $$
DECLARE
  v_game_id uuid;
BEGIN
  -- Verify the user is a business
  IF NOT EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = p_business_id 
    AND account_type = 'business'
  ) THEN
    RAISE EXCEPTION 'Only businesses can create games';
  END IF;
  
  -- Create the game (force single player)
  INSERT INTO restaurant_games (
    business_id, 
    name, 
    description, 
    entry_fee, 
    max_players, 
    min_score,
    game_type,
    emoji
  )
  VALUES (
    p_business_id,
    p_name,
    p_description,
    p_entry_fee,
    1, -- Always single player
    p_min_score,
    p_game_type,
    p_emoji
  )
  RETURNING id INTO v_game_id;
  
  RETURN v_game_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update admin_add_test_credits function to handle business accounts
CREATE OR REPLACE FUNCTION admin_add_test_credits(
  target_user_id uuid,
  amount decimal,
  admin_user_id uuid
)
RETURNS void AS $$
BEGIN
  -- Verify the calling user is an admin
  IF NOT EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = admin_user_id 
    AND account_type = 'admin'
  ) THEN
    RAISE EXCEPTION 'Only admins can add test credits';
  END IF;
  
  -- Verify target user exists
  IF NOT EXISTS (
    SELECT 1 FROM profiles WHERE id = target_user_id
  ) THEN
    RAISE EXCEPTION 'Target user not found';
  END IF;
  
  -- Add credits to target user
  UPDATE profiles
  SET balance = balance + amount,
      updated_at = now()
  WHERE id = target_user_id;
  
  -- Log the transaction
  INSERT INTO transactions (user_id, type, amount, status, payment_method)
  VALUES (target_user_id, 'deposit', amount, 'completed', 'Admin Test Credits');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update create_user_profile function to handle business accounts
CREATE OR REPLACE FUNCTION create_user_profile(
  user_id uuid,
  user_email text,
  user_username text,
  user_account_type account_type
)
RETURNS void AS $$
DECLARE
  existing_user_count integer;
BEGIN
  -- Check if profile already exists
  SELECT COUNT(*) INTO existing_user_count FROM profiles WHERE id = user_id;
  
  IF existing_user_count > 0 THEN
    RAISE NOTICE 'User profile already exists for ID: %', user_id;
    RETURN;
  END IF;

  -- Check for duplicate username
  SELECT COUNT(*) INTO existing_user_count FROM profiles WHERE username = user_username;
  
  IF existing_user_count > 0 THEN
    RAISE EXCEPTION 'Username already exists: %', user_username;
  END IF;

  -- Check for duplicate email
  SELECT COUNT(*) INTO existing_user_count FROM profiles WHERE email = user_email;
  
  IF existing_user_count > 0 THEN
    RAISE EXCEPTION 'Email already exists: %', user_email;
  END IF;

  -- Insert the user profile into profiles table
  INSERT INTO profiles (id, email, username, account_type, balance, is_kyc_verified, created_at, updated_at)
  VALUES (
    user_id,
    user_email,
    user_username,
    user_account_type,
    CASE 
      WHEN user_account_type = 'admin' THEN 1000.00  -- Give admins starting balance for testing
      ELSE 0.00 
    END,
    CASE 
      WHEN user_account_type = 'business' THEN false 
      WHEN user_account_type = 'admin' THEN true  -- Admins are pre-verified
      ELSE null 
    END,
    now(),
    now()
  );

  RAISE NOTICE 'User profile created successfully for: %', user_email;

EXCEPTION
  WHEN unique_violation THEN
    RAISE EXCEPTION 'Username or email already exists: %', user_email;
  WHEN OTHERS THEN
    RAISE EXCEPTION 'Failed to create user profile: %', SQLERRM;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION create_restaurant_game TO authenticated;
GRANT EXECUTE ON FUNCTION admin_add_test_credits TO authenticated;
GRANT EXECUTE ON FUNCTION create_user_profile TO authenticated;

-- Update indexes
CREATE INDEX IF NOT EXISTS idx_restaurant_games_business_id ON restaurant_games(business_id);
DROP INDEX IF EXISTS idx_restaurant_games_restaurant_id;

-- Update comments and documentation
COMMENT ON TABLE restaurant_games IS 'Games created by local businesses for customer engagement';
COMMENT ON COLUMN restaurant_games.business_id IS 'ID of the business that created this game';