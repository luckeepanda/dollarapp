/*
  # Fix INSERT policy for users table

  1. Security Changes
    - Update policy to allow public access for user registration
    - Maintain security through WITH CHECK clause that ensures users can only insert their own profile
    - This enables user profile creation immediately after authentication signup

  2. Policy Details
    - Changed from TO authenticated to TO public to allow initial profile creation
    - WITH CHECK clause still ensures auth.uid() = id for security
    - Users can only create profiles for themselves
*/

-- Drop the existing INSERT policy
DROP POLICY IF EXISTS "Users can insert own profile" ON users;

-- Create new INSERT policy that allows public access but maintains security
CREATE POLICY "Users can insert own profile"
  ON users
  FOR INSERT
  TO public
  WITH CHECK (auth.uid() = id);