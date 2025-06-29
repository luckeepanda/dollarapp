/*
  # Fix Registration RLS Policies

  1. Security Changes
    - Split INSERT policy into separate policies for authenticated and anonymous users
    - Allow anonymous users to insert during registration process
    - Maintain security for authenticated users

  2. Policy Updates
    - Remove overly restrictive INSERT policy
    - Add separate policies for different user types during registration
*/

-- Drop the problematic INSERT policy
DROP POLICY IF EXISTS "Users can insert during registration" ON users;

-- Create separate INSERT policies for authenticated and anonymous users
CREATE POLICY "Authenticated users can insert own profile"
  ON users
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Anonymous users can insert during registration"
  ON users
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Ensure RLS is enabled
ALTER TABLE users ENABLE ROW LEVEL SECURITY;