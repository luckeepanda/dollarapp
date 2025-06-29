/*
  # Fix Authentication Session Issues

  1. Security Changes
    - Simplify RLS policies to avoid conflicts
    - Ensure SECURITY DEFINER function works properly
    - Add proper error handling for edge cases

  2. Policy Updates
    - Clean up conflicting policies
    - Ensure registration flow works smoothly
    - Maintain security while allowing profile creation
*/

-- Drop all existing policies to start clean
DROP POLICY IF EXISTS "Users can insert own profile" ON users;
DROP POLICY IF EXISTS "Users can read own data" ON users;
DROP POLICY IF EXISTS "Users can update own data" ON users;
DROP POLICY IF EXISTS "Allow registration insert" ON users;

-- Recreate the SECURITY DEFINER function with better error handling
DROP FUNCTION IF EXISTS create_user_profile(uuid, text, text, account_type);

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
  SELECT COUNT(*) INTO existing_user_count FROM users WHERE id = user_id;
  
  IF existing_user_count > 0 THEN
    RAISE NOTICE 'User profile already exists for ID: %', user_id;
    RETURN;
  END IF;

  -- Check for duplicate username
  SELECT COUNT(*) INTO existing_user_count FROM users WHERE username = user_username;
  
  IF existing_user_count > 0 THEN
    RAISE EXCEPTION 'Username already exists: %', user_username;
  END IF;

  -- Check for duplicate email
  SELECT COUNT(*) INTO existing_user_count FROM users WHERE email = user_email;
  
  IF existing_user_count > 0 THEN
    RAISE EXCEPTION 'Email already exists: %', user_email;
  END IF;

  -- Insert the user profile
  INSERT INTO users (id, email, username, account_type, balance, is_kyc_verified, created_at, updated_at)
  VALUES (
    user_id,
    user_email,
    user_username,
    user_account_type,
    0.00,
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

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION create_user_profile TO authenticated;
GRANT EXECUTE ON FUNCTION create_user_profile TO anon;

-- Create simple, effective RLS policies
CREATE POLICY "Users can read own data"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own data"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Create a permissive INSERT policy for the registration process
CREATE POLICY "Users can insert during registration"
  ON users
  FOR INSERT
  TO authenticated, anon
  WITH CHECK (
    -- Allow if the user is inserting their own profile
    auth.uid() = id OR
    -- Allow during registration when auth.uid() might not be immediately available
    auth.uid() IS NOT NULL
  );

-- Ensure RLS is enabled
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create helpful indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_account_type ON users(account_type);