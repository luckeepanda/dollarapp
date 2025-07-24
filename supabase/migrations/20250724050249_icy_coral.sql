/*
  # Add QR Code Rejection Status

  1. Database Changes
    - Add rejection_reason column to player_qr_codes table
    - Add rejected_at timestamp column
    - Update redeem_player_qr_code function to handle rejections
    - Add function to remove rejected QR codes

  2. Security
    - Maintain existing RLS policies
    - Add policy for users to delete their own rejected QR codes

  3. Functions
    - Update redemption function to support rejection
    - Add function to remove rejected QR codes
*/

-- Add rejection columns to player_qr_codes table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'player_qr_codes' AND column_name = 'rejection_reason'
  ) THEN
    ALTER TABLE player_qr_codes ADD COLUMN rejection_reason text;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'player_qr_codes' AND column_name = 'rejected_at'
  ) THEN
    ALTER TABLE player_qr_codes ADD COLUMN rejected_at timestamptz;
  END IF;
END $$;

-- Update the redeem_player_qr_code function to handle rejections
CREATE OR REPLACE FUNCTION redeem_player_qr_code(
  p_qr_code text,
  p_restaurant_id uuid,
  p_approved boolean DEFAULT true,
  p_rejection_reason text DEFAULT null
)
RETURNS jsonb AS $$
DECLARE
  v_qr_record RECORD;
BEGIN
  -- Find the QR code
  SELECT * INTO v_qr_record
  FROM player_qr_codes
  WHERE code = p_qr_code 
    AND is_redeemed = false
    AND rejected_at IS NULL;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Invalid QR code, already redeemed, or already rejected'
    );
  END IF;
  
  IF p_approved THEN
    -- Mark QR as redeemed
    UPDATE player_qr_codes
    SET is_redeemed = true,
        redeemed_at = now(),
        redeemed_by = p_restaurant_id
    WHERE id = v_qr_record.id;
    
    -- Add prize money to restaurant balance (110% of prize amount)
    UPDATE profiles
    SET balance = balance + (v_qr_record.prize_amount * 1.1),
        updated_at = now()
    WHERE id = p_restaurant_id;
    
    RETURN jsonb_build_object(
      'success', true,
      'amount', v_qr_record.prize_amount,
      'game_name', v_qr_record.game_name,
      'player_id', v_qr_record.user_id
    );
  ELSE
    -- Mark QR as rejected
    UPDATE player_qr_codes
    SET rejected_at = now(),
        rejection_reason = COALESCE(p_rejection_reason, 'Rejected by restaurant'),
        redeemed_by = p_restaurant_id
    WHERE id = v_qr_record.id;
    
    RETURN jsonb_build_object(
      'success', false,
      'rejected', true,
      'message', 'QR code has been rejected',
      'game_name', v_qr_record.game_name,
      'player_id', v_qr_record.user_id
    );
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to remove rejected QR codes
CREATE OR REPLACE FUNCTION remove_rejected_qr_code(
  p_qr_code text,
  p_user_id uuid
)
RETURNS boolean AS $$
BEGIN
  -- Delete the rejected QR code (only if it belongs to the user and is rejected)
  DELETE FROM player_qr_codes
  WHERE code = p_qr_code 
    AND user_id = p_user_id
    AND rejected_at IS NOT NULL
    AND is_redeemed = false;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add policy for users to delete their own rejected QR codes
CREATE POLICY "Users can delete own rejected QR codes"
  ON player_qr_codes
  FOR DELETE
  TO authenticated
  USING (
    auth.uid() = user_id 
    AND rejected_at IS NOT NULL 
    AND is_redeemed = false
  );

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION remove_rejected_qr_code TO authenticated;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_player_qr_codes_rejected ON player_qr_codes(rejected_at);
CREATE INDEX IF NOT EXISTS idx_player_qr_codes_status ON player_qr_codes(is_redeemed, rejected_at);