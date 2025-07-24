/*
  # Add Policy for Players to Remove Redeemed QR Codes

  1. Security Changes
    - Add RLS policy to allow players to delete their own redeemed QR codes
    - Ensure only redeemed codes can be deleted (not active ones)
    - Maintain security by restricting to code owner only

  2. Policy Details
    - Users can only delete QR codes that belong to them
    - QR codes must be redeemed (is_redeemed = true)
    - Prevents deletion of active/pending QR codes
*/

-- Add policy for users to delete their own redeemed QR codes
CREATE POLICY "Users can delete own redeemed QR codes"
  ON player_qr_codes
  FOR DELETE
  TO authenticated
  USING (
    auth.uid() = user_id 
    AND is_redeemed = true
  );

-- Create index for better performance on redeemed status
CREATE INDEX IF NOT EXISTS idx_player_qr_codes_redeemed_user ON player_qr_codes(user_id, is_redeemed);