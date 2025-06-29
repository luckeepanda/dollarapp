/*
  # Fix user registration RLS policy

  1. Security Changes
    - Drop existing INSERT policy that may be too restrictive
    - Create new INSERT policy that allows authenticated users to insert their own profile
    - Ensure the policy works for newly authenticated users during registration flow

  2. Policy Details
    - Allow INSERT for authenticated users (not public to maintain security)
    - Use WITH CHECK to ensure users can only insert their own profile
    - This should work for the registration flow where auth.uid() is available
*/

-- Drop the existing INSERT policy
DROP POLICY IF EXISTS "Users can insert own profile" ON users;

-- Create new INSERT policy for authenticated users
CREATE POLICY "Users can insert own profile"
  ON users
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Also ensure we have proper SELECT policy for users to read their own data
DROP POLICY IF EXISTS "Users can read own data" ON users;

CREATE POLICY "Users can read own data"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Ensure RLS is enabled
ALTER TABLE users ENABLE ROW LEVEL SECURITY;