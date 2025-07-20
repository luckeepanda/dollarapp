/*
  # Create Player QR Codes Table

  1. New Tables
    - `player_qr_codes`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to profiles)
      - `code` (text, unique) - the alphanumeric QR code
      - `source_type` (enum) - tournament, restaurant_game, etc.
      - `source_id` (uuid) - ID of the tournament/game that generated this
      - `game_name` (text) - name of the game/tournament
      - `prize_amount` (decimal) - value of the prize
      - `is_redeemed` (boolean, default false)
      - `redeemed_at` (timestamp, nullable)
      - `redeemed_by` (uuid, foreign key to profiles, nullable) - restaurant that redeemed it
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on player_qr_codes table
    - Add policies for players to read their own QR codes
    - Add policies for restaurants to redeem QR codes

  3. Functions
    - Function to create QR code for tournament winner
    - Function to create QR code for restaurant game winner
    - Function to redeem QR code
*/

-- Create source type enum
CREATE TYPE qr_source_type AS ENUM ('tournament', 'restaurant_game', 'manual');

-- Create player_qr_codes table
CREATE TABLE IF NOT EXISTS player_qr_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  code text UNIQUE NOT NULL,
  source_type qr_source_type NOT NULL,
  source_id uuid,
  game_name text NOT NULL,
  prize_amount decimal(10,2) NOT NULL DEFAULT 0.00,
  is_redeemed boolean DEFAULT false,
  redeemed_at timestamptz,
  redeemed_by uuid REFERENCES profiles(id),
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE player_qr_codes ENABLE ROW LEVEL SECURITY;

-- Policies for player_qr_codes
CREATE POLICY "Players can read own QR codes"
  ON player_qr_codes
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Restaurants can read QR codes for redemption"
  ON player_qr_codes
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.account_type = 'restaurant'
    )
    AND is_redeemed = false
  );

CREATE POLICY "System can insert QR codes"
  ON player_qr_codes
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Restaurants can update QR codes for redemption"
  ON player_qr_codes
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.account_type = 'restaurant'
    )
  );

-- Function to create tournament winner QR code
CREATE OR REPLACE FUNCTION create_tournament_qr_code(
  p_user_id uuid,
  p_tournament_id uuid,
  p_game_name text,
  p_prize_amount decimal DEFAULT 5.00
)
RETURNS text AS $$
DECLARE
  v_qr_code text;
BEGIN
  -- Generate unique QR code
  v_qr_code := 'TRN-' || upper(substring(gen_random_uuid()::text from 1 for 8));
  
  -- Insert QR code record
  INSERT INTO player_qr_codes (
    user_id,
    code,
    source_type,
    source_id,
    game_name,
    prize_amount
  )
  VALUES (
    p_user_id,
    v_qr_code,
    'tournament',
    p_tournament_id,
    p_game_name,
    p_prize_amount
  );
  
  RETURN v_qr_code;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create restaurant game winner QR code
CREATE OR REPLACE FUNCTION create_restaurant_game_qr_code(
  p_user_id uuid,
  p_game_id uuid,
  p_game_name text,
  p_prize_amount decimal
)
RETURNS text AS $$
DECLARE
  v_qr_code text;
BEGIN
  -- Generate unique QR code
  v_qr_code := 'RG-' || upper(substring(gen_random_uuid()::text from 1 for 8));
  
  -- Insert QR code record
  INSERT INTO player_qr_codes (
    user_id,
    code,
    source_type,
    source_id,
    game_name,
    prize_amount
  )
  VALUES (
    p_user_id,
    v_qr_code,
    'restaurant_game',
    p_game_id,
    p_game_name,
    p_prize_amount
  );
  
  RETURN v_qr_code;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to redeem QR code
CREATE OR REPLACE FUNCTION redeem_player_qr_code(
  p_qr_code text,
  p_restaurant_id uuid
)
RETURNS jsonb AS $$
DECLARE
  v_qr_record RECORD;
BEGIN
  -- Find the QR code
  SELECT * INTO v_qr_record
  FROM player_qr_codes
  WHERE code = p_qr_code 
    AND is_redeemed = false;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Invalid QR code or already redeemed'
    );
  END IF;
  
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
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION create_tournament_qr_code TO authenticated;
GRANT EXECUTE ON FUNCTION create_restaurant_game_qr_code TO authenticated;
GRANT EXECUTE ON FUNCTION redeem_player_qr_code TO authenticated;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_player_qr_codes_user_id ON player_qr_codes(user_id);
CREATE INDEX IF NOT EXISTS idx_player_qr_codes_code ON player_qr_codes(code);
CREATE INDEX IF NOT EXISTS idx_player_qr_codes_redeemed ON player_qr_codes(is_redeemed);
CREATE INDEX IF NOT EXISTS idx_player_qr_codes_source ON player_qr_codes(source_type, source_id);