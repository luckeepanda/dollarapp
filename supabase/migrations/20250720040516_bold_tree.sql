/*
  # Add Admin Role Support

  1. Database Changes
    - Update account_type enum to include 'admin'
    - This allows admin users to be created and managed

  2. Security
    - Maintain existing RLS policies
    - Admin users will have same base permissions as other users
    - Admin-specific features will be handled in application logic
*/

-- Add 'admin' to the account_type enum
ALTER TYPE account_type ADD VALUE 'admin';

-- Update the create_user_profile function to support admin accounts
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
      WHEN user_account_type = 'restaurant' THEN false 
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

-- Create admin-only function to add test credits
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

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION admin_add_test_credits TO authenticated;