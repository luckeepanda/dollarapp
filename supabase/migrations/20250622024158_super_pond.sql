/*
  # Add missing INSERT policy for users table

  1. Security Changes
    - Add policy to allow authenticated users to insert their own profile data
    - This enables user profile creation after successful authentication

  2. Policy Details
    - Users can only insert records where the id matches their auth.uid()
    - Prevents users from creating profiles for other users
*/

-- Add INSERT policy for users table
CREATE POLICY "Users can insert own profile"
  ON users
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);