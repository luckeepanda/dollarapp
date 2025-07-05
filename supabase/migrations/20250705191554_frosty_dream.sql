/*
  # Remove Default Balance for New Users

  1. Changes
    - Remove default balance of $10.00 for new profiles
    - Reset existing user balances to $0.00
    - Update the create_user_profile function to use $0.00 default

  2. Purpose
    - Remove the testing default balance
    - Require users to explicitly add funds to play
    - Make the system more realistic for production use
*/

-- Remove default balance for new profiles
ALTER TABLE profiles ALTER COLUMN balance SET DEFAULT 0.00;

-- Reset all existing user balances to $0.00
UPDATE profiles 
SET balance = 0.00, 
    updated_at = now();

-- Update the create_user_profile function to use $0.00 default
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

  -- Insert the user profile into profiles table with $0.00 balance
  INSERT INTO profiles (id, email, username, account_type, balance, is_kyc_verified, created_at, updated_at)
  VALUES (
    user_id,
    user_email,
    user_username,
    user_account_type,
    0.00,  -- Set balance to $0.00 instead of $10.00
    CASE 
      WHEN user_account_type = 'restaurant' THEN false 
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