/*
  # Fix User Registration RLS Issues

  1. Security Changes
    - Update the create_user_profile function to handle edge cases
    - Ensure proper RLS policies for user registration
    - Add better error handling for profile creation

  2. Function Updates
    - Improve the SECURITY DEFINER function
    - Add proper error handling
    - Ensure the function can handle all registration scenarios

  3. Policy Updates
    - Simplify RLS policies to avoid conflicts
    - Ensure authenticated users can create their own profiles
*/

-- Drop existing function and recreate with better error handling
DROP FUNCTION IF EXISTS create_user_profile(uuid, text, text, account_type);

-- Create improved user profile creation function
CREATE OR REPLACE FUNCTION create_user_profile(
  user_id uuid,
  user_email text,
  user_username text,
  user_account_type account_type
)
RETURNS void AS $$
BEGIN
  -- Check if profile already exists
  IF EXISTS (SELECT 1 FROM users WHERE id = user_id) THEN
    RAISE EXCEPTION 'User profile already exists for ID: %', user_id;
  END IF;

  -- Insert the user profile, bypassing RLS due to SECURITY DEFINER
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

  -- Log successful creation
  RAISE NOTICE 'User profile created successfully for: %', user_email;

EXCEPTION
  WHEN unique_violation THEN
    RAISE EXCEPTION 'Username or email already exists: %', user_email;
  WHEN OTHERS THEN
    RAISE EXCEPTION 'Failed to create user profile: %', SQLERRM;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated and anon users
GRANT EXECUTE ON FUNCTION create_user_profile TO authenticated;
GRANT EXECUTE ON FUNCTION create_user_profile TO anon;

-- Drop all existing policies to start fresh
DROP POLICY IF EXISTS "Users can insert own profile" ON users;
DROP POLICY IF EXISTS "Users can read own data" ON users;
DROP POLICY IF EXISTS "Users can update own data" ON users;
DROP POLICY IF EXISTS "Allow profile creation function" ON users;

-- Create clean, simple RLS policies
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

-- Create a permissive INSERT policy for registration
CREATE POLICY "Users can insert own profile"
  ON users
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Also allow anon users to insert (for the brief moment during registration)
CREATE POLICY "Allow registration insert"
  ON users
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Ensure RLS is enabled
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);