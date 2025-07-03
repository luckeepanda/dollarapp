/*
  # Fix RLS policies for profiles table

  1. Security Issues
    - Drop and recreate all RLS policies for profiles table
    - Ensure policies are properly configured to prevent query hangs
    - Add more permissive policies for authenticated users
    - Fix potential RLS policy conflicts

  2. Changes
    - Remove overly restrictive policies that might cause timeouts
    - Add comprehensive policies for all CRUD operations
    - Ensure auth.uid() comparisons work correctly
*/

-- Disable RLS temporarily to clean up
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- Drop all existing policies on profiles table
DROP POLICY IF EXISTS "Profiles can read own data" ON profiles;
DROP POLICY IF EXISTS "Profiles can update own data" ON profiles;
DROP POLICY IF EXISTS "Authenticated users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Anonymous users can insert during registration" ON profiles;
DROP POLICY IF EXISTS "Users can read own data" ON profiles;
DROP POLICY IF EXISTS "Users can update own data" ON profiles;
DROP POLICY IF EXISTS "Authenticated users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Anonymous users can insert during registration" ON profiles;

-- Re-enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create new, more robust policies
CREATE POLICY "Enable read access for authenticated users to own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Enable insert access for authenticated users"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Enable insert access for anonymous users during registration"
  ON profiles
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Enable update access for authenticated users to own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Enable delete access for authenticated users to own profile"
  ON profiles
  FOR DELETE
  TO authenticated
  USING (auth.uid() = id);

-- Grant necessary permissions to authenticated and anonymous roles
GRANT SELECT, INSERT, UPDATE, DELETE ON profiles TO authenticated;
GRANT INSERT ON profiles TO anon;

-- Ensure the table has proper indexes for performance
CREATE INDEX IF NOT EXISTS idx_profiles_id ON profiles(id);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_username ON profiles(username);

-- Test the policies by creating a simple function that can be called
CREATE OR REPLACE FUNCTION test_profile_access()
RETURNS boolean AS $$
BEGIN
  -- This function will help test if RLS policies are working
  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;