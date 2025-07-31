/*
  # Fix Live Games Access for Unauthenticated Users

  1. Security Changes
    - Add public read access policy for active restaurant games
    - Allow unauthenticated users to view active games
    - Maintain security for other operations

  2. Policy Details
    - Public users can only read active restaurant games
    - No access to completed, cancelled, or other sensitive data
    - Maintains existing security for authenticated operations
*/

-- Add policy to allow public read access to active restaurant games
CREATE POLICY "Public can read active restaurant games"
  ON restaurant_games
  FOR SELECT
  TO public
  USING (status = 'active');

-- Add policy to allow public read access to restaurant profiles for game display
CREATE POLICY "Public can read restaurant profiles for games"
  ON profiles
  FOR SELECT
  TO public
  USING (account_type = 'restaurant');