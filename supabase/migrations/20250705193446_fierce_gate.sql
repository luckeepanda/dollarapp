/*
  # Restaurant-Created Games System

  1. New Tables
    - `restaurant_games`
      - `id` (uuid, primary key)
      - `restaurant_id` (uuid, foreign key to profiles)
      - `name` (text)
      - `description` (text)
      - `entry_fee` (decimal)
      - `max_players` (integer, default 5)
      - `current_players` (integer, default 0)
      - `prize_pool` (decimal, default 0)
      - `min_score` (integer)
      - `status` (enum: active, completed, cancelled)
      - `winner_id` (uuid, foreign key, nullable)
      - `winning_score` (integer, nullable)
      - `qr_code` (text, nullable - generated when winner is determined)
      - `qr_redeemed` (boolean, default false)
      - `created_at` (timestamp)
      - `completed_at` (timestamp, nullable)
    
    - `restaurant_game_entries`
      - `id` (uuid, primary key)
      - `game_id` (uuid, foreign key)
      - `user_id` (uuid, foreign key)
      - `score` (integer)
      - `completed_at` (timestamp)
      - `created_at` (timestamp)

  2. Functions
    - Function to create restaurant game
    - Function to join restaurant game
    - Function to submit score and determine winner
    - Function to redeem QR code

  3. Security
    - Enable RLS on both tables
    - Add appropriate policies for restaurants and players
*/

-- Create restaurant game status enum
CREATE TYPE restaurant_game_status AS ENUM ('active', 'completed', 'cancelled');

-- Create restaurant_games table
CREATE TABLE IF NOT EXISTS restaurant_games (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text NOT NULL,
  entry_fee decimal(10,2) NOT NULL,
  max_players integer NOT NULL DEFAULT 5,
  current_players integer DEFAULT 0,
  prize_pool decimal(10,2) DEFAULT 0.00,
  min_score integer NOT NULL,
  status restaurant_game_status DEFAULT 'active',
  winner_id uuid REFERENCES profiles(id),
  winning_score integer,
  qr_code text UNIQUE,
  qr_redeemed boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  completed_at timestamptz
);

-- Create restaurant_game_entries table
CREATE TABLE IF NOT EXISTS restaurant_game_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id uuid REFERENCES restaurant_games(id) ON DELETE CASCADE,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  score integer NOT NULL,
  completed_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  UNIQUE(game_id, user_id)
);

-- Enable Row Level Security
ALTER TABLE restaurant_games ENABLE ROW LEVEL SECURITY;
ALTER TABLE restaurant_game_entries ENABLE ROW LEVEL SECURITY;

-- Policies for restaurant_games
CREATE POLICY "Anyone can read active restaurant games"
  ON restaurant_games
  FOR SELECT
  TO authenticated
  USING (status = 'active');

CREATE POLICY "Restaurants can manage their own games"
  ON restaurant_games
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.account_type = 'restaurant'
      AND profiles.id = restaurant_id
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.account_type = 'restaurant'
      AND profiles.id = restaurant_id
    )
  );

CREATE POLICY "Restaurants can read completed games for QR redemption"
  ON restaurant_games
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.account_type = 'restaurant'
      AND profiles.id = restaurant_id
    )
    AND status = 'completed'
    AND qr_code IS NOT NULL
  );

-- Policies for restaurant_game_entries
CREATE POLICY "Anyone can read game entries"
  ON restaurant_game_entries
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Players can insert own entries"
  ON restaurant_game_entries
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "System can update entries"
  ON restaurant_game_entries
  FOR UPDATE
  TO authenticated
  USING (true);

-- Function to create restaurant game
CREATE OR REPLACE FUNCTION create_restaurant_game(
  p_restaurant_id uuid,
  p_name text,
  p_description text,
  p_entry_fee decimal,
  p_max_players integer,
  p_min_score integer
)
RETURNS uuid AS $$
DECLARE
  v_game_id uuid;
BEGIN
  -- Verify the user is a restaurant
  IF NOT EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = p_restaurant_id 
    AND account_type = 'restaurant'
  ) THEN
    RAISE EXCEPTION 'Only restaurants can create games';
  END IF;
  
  -- Create the game
  INSERT INTO restaurant_games (
    restaurant_id, 
    name, 
    description, 
    entry_fee, 
    max_players, 
    min_score
  )
  VALUES (
    p_restaurant_id,
    p_name,
    p_description,
    p_entry_fee,
    p_max_players,
    p_min_score
  )
  RETURNING id INTO v_game_id;
  
  RETURN v_game_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to join restaurant game
CREATE OR REPLACE FUNCTION join_restaurant_game(
  p_game_id uuid,
  p_user_id uuid
)
RETURNS boolean AS $$
DECLARE
  v_entry_fee decimal;
  v_user_balance decimal;
  v_current_players integer;
  v_max_players integer;
BEGIN
  -- Get game details
  SELECT entry_fee, current_players, max_players 
  INTO v_entry_fee, v_current_players, v_max_players
  FROM restaurant_games
  WHERE id = p_game_id AND status = 'active';
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Game not found or not active';
  END IF;
  
  -- Check if game is full
  IF v_current_players >= v_max_players THEN
    RAISE EXCEPTION 'Game is full';
  END IF;
  
  -- Check if user already joined
  IF EXISTS (
    SELECT 1 FROM restaurant_game_entries 
    WHERE game_id = p_game_id AND user_id = p_user_id
  ) THEN
    RAISE EXCEPTION 'User already joined this game';
  END IF;
  
  -- Check user balance
  SELECT balance INTO v_user_balance
  FROM profiles
  WHERE id = p_user_id;
  
  IF v_user_balance < v_entry_fee THEN
    RAISE EXCEPTION 'Insufficient balance';
  END IF;
  
  -- Deduct entry fee from user
  UPDATE profiles
  SET balance = balance - v_entry_fee,
      updated_at = now()
  WHERE id = p_user_id;
  
  -- Update game stats
  UPDATE restaurant_games
  SET current_players = current_players + 1,
      prize_pool = prize_pool + v_entry_fee
  WHERE id = p_game_id;
  
  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to submit score to restaurant game
CREATE OR REPLACE FUNCTION submit_restaurant_game_score(
  p_game_id uuid,
  p_user_id uuid,
  p_score integer
)
RETURNS jsonb AS $$
DECLARE
  v_min_score integer;
  v_current_players integer;
  v_max_players integer;
  v_entry_count integer;
  v_winner_id uuid;
  v_winning_score integer;
  v_qr_code text;
  v_game_completed boolean := false;
BEGIN
  -- Get game details
  SELECT min_score, current_players, max_players
  INTO v_min_score, v_current_players, v_max_players
  FROM restaurant_games
  WHERE id = p_game_id AND status = 'active';
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Game not found or not active';
  END IF;
  
  -- Insert the score
  INSERT INTO restaurant_game_entries (game_id, user_id, score)
  VALUES (p_game_id, p_user_id, p_score)
  ON CONFLICT (game_id, user_id) 
  DO UPDATE SET score = p_score, completed_at = now();
  
  -- Count entries
  SELECT COUNT(*) INTO v_entry_count
  FROM restaurant_game_entries
  WHERE game_id = p_game_id;
  
  -- Check if all players have played
  IF v_entry_count >= v_max_players THEN
    -- Find the winner (highest score)
    SELECT user_id, score INTO v_winner_id, v_winning_score
    FROM restaurant_game_entries
    WHERE game_id = p_game_id
    ORDER BY score DESC, completed_at ASC
    LIMIT 1;
    
    -- Generate unique QR code
    v_qr_code := 'RG-' || upper(substring(gen_random_uuid()::text from 1 for 8));
    
    -- Update game with winner and QR code
    UPDATE restaurant_games
    SET status = 'completed',
        winner_id = v_winner_id,
        winning_score = v_winning_score,
        qr_code = v_qr_code,
        completed_at = now()
    WHERE id = p_game_id;
    
    v_game_completed := true;
  END IF;
  
  RETURN jsonb_build_object(
    'game_completed', v_game_completed,
    'winner_id', v_winner_id,
    'winning_score', v_winning_score,
    'qr_code', v_qr_code,
    'your_score', p_score,
    'qualified', p_score >= v_min_score,
    'entries_count', v_entry_count,
    'max_players', v_max_players
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to redeem QR code
CREATE OR REPLACE FUNCTION redeem_restaurant_qr(
  p_qr_code text,
  p_restaurant_id uuid
)
RETURNS jsonb AS $$
DECLARE
  v_game_record RECORD;
  v_prize_amount decimal;
BEGIN
  -- Find the game with this QR code
  SELECT * INTO v_game_record
  FROM restaurant_games
  WHERE qr_code = p_qr_code 
    AND restaurant_id = p_restaurant_id
    AND status = 'completed'
    AND qr_redeemed = false;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Invalid QR code or already redeemed'
    );
  END IF;
  
  v_prize_amount := v_game_record.prize_pool;
  
  -- Mark QR as redeemed
  UPDATE restaurant_games
  SET qr_redeemed = true
  WHERE id = v_game_record.id;
  
  -- Add prize money to restaurant balance
  UPDATE profiles
  SET balance = balance + v_prize_amount,
      updated_at = now()
  WHERE id = p_restaurant_id;
  
  RETURN jsonb_build_object(
    'success', true,
    'amount', v_prize_amount,
    'game_name', v_game_record.name,
    'winner_id', v_game_record.winner_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION create_restaurant_game TO authenticated;
GRANT EXECUTE ON FUNCTION join_restaurant_game TO authenticated;
GRANT EXECUTE ON FUNCTION submit_restaurant_game_score TO authenticated;
GRANT EXECUTE ON FUNCTION redeem_restaurant_qr TO authenticated;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_restaurant_games_restaurant_id ON restaurant_games(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_restaurant_games_status ON restaurant_games(status);
CREATE INDEX IF NOT EXISTS idx_restaurant_games_qr_code ON restaurant_games(qr_code);
CREATE INDEX IF NOT EXISTS idx_restaurant_game_entries_game_id ON restaurant_game_entries(game_id);
CREATE INDEX IF NOT EXISTS idx_restaurant_game_entries_user_id ON restaurant_game_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_restaurant_game_entries_score ON restaurant_game_entries(score DESC);