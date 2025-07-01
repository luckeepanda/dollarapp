/*
  # Rename users table to profiles

  1. Table Changes
    - Rename `users` table to `profiles`
    - Update all foreign key references in other tables
    - Update all RLS policies to reference the new table name
    - Update all functions to use the new table name

  2. Security
    - Maintain all existing RLS policies with updated table references
    - Ensure all functions continue to work with the new table name

  3. Data Integrity
    - Preserve all existing data during the rename
    - Maintain all relationships and constraints
*/

-- Rename the users table to profiles
ALTER TABLE users RENAME TO profiles;

-- Update foreign key constraints in other tables
-- Note: PostgreSQL automatically updates foreign key references when renaming tables

-- Drop existing policies (they reference the old table name)
DROP POLICY IF EXISTS "Users can read own data" ON profiles;
DROP POLICY IF EXISTS "Users can update own data" ON profiles;
DROP POLICY IF EXISTS "Authenticated users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Anonymous users can insert during registration" ON profiles;

-- Recreate policies with updated names and references
CREATE POLICY "Profiles can read own data"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Profiles can update own data"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Authenticated users can insert own profile"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Anonymous users can insert during registration"
  ON profiles
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Update QR codes policies to reference profiles table
DROP POLICY IF EXISTS "Users can read own QR codes" ON qr_codes;
DROP POLICY IF EXISTS "Restaurants can update QR codes for redemption" ON qr_codes;

CREATE POLICY "Users can read own QR codes"
  ON qr_codes
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id OR auth.uid() = redeemed_by);

CREATE POLICY "Restaurants can update QR codes for redemption"
  ON qr_codes
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.account_type = 'restaurant'
    )
  );

-- Update functions to reference profiles table
CREATE OR REPLACE FUNCTION add_balance(user_id uuid, amount decimal)
RETURNS void AS $$
BEGIN
  UPDATE profiles 
  SET balance = balance + amount,
      updated_at = now()
  WHERE id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION deduct_balance(user_id uuid, amount decimal)
RETURNS void AS $$
BEGIN
  UPDATE profiles 
  SET balance = balance - amount,
      updated_at = now()
  WHERE id = user_id
  AND balance >= amount;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Insufficient balance';
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update the create_user_profile function to use profiles table
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

-- Update indexes to reference profiles table
DROP INDEX IF EXISTS idx_users_email;
DROP INDEX IF EXISTS idx_users_username;
DROP INDEX IF EXISTS idx_users_account_type;

CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_username ON profiles(username);
CREATE INDEX IF NOT EXISTS idx_profiles_account_type ON profiles(account_type);

-- Ensure RLS is enabled on the renamed table
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;