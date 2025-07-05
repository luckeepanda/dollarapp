/*
  # Allow Multiple Entries Per User Per Restaurant Game

  1. Database Changes
    - Remove unique constraint on (game_id, user_id) in restaurant_game_entries
    - Add entry_number to track multiple attempts
    - Update functions to handle multiple entries per user

  2. Functions
    - Update join_restaurant_game to allow multiple entries
    - Update submit_restaurant_game_score to handle multiple attempts
    - Keep only the best score for winner determination

  3. Security
    - Maintain existing RLS policies
    - Ensure users still pay entry fee for each attempt
*/

-- Remove the unique constraint that prevents multiple entries per user per game
ALTER TABLE restaurant_game_entries DROP CONSTRAINT IF EXISTS restaurant_game_entries_game_id_user_id_key;

-- Add entry_number to track multiple attempts by the same user
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'restaurant_game_entries' AND column_name = 'entry_number'
  ) THEN
    ALTER TABLE restaurant_game_entries ADD COLUMN entry_number integer DEFAULT 1;
  END IF;
END $$;

-- Create a new unique constraint that includes entry_number
ALTER TABLE restaurant_game_entries 
ADD CONSTRAINT restaurant_game_entries_game_user_entry_unique 
UNIQUE (game_id, user_id, entry_number);

-- Update the join_restaurant_game function to allow multiple entries
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
  v_game_status text;
BEGIN
  -- Get game details
  SELECT entry_fee, current_players, max_players, status
  INTO v_entry_fee, v_current_players, v_max_players, v_game_status
  FROM restaurant_games
  WHERE id = p_game_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Game not found';
  END IF;
  
  -- Check if game is still active
  IF v_game_status != 'active' THEN
    RAISE EXCEPTION 'Game is no longer active';
  END IF;
  
  -- Check if game is full
  IF v_current_players >= v_max_players THEN
    RAISE EXCEPTION 'Game is full';
  END IF;
  
  -- Check user balance
  SELECT balance INTO v_user_balance
  FROM profiles
  WHERE id = p_user_id;
  
  IF v_user_balance < v_entry_fee THEN
    RAISE EXCEPTION 'Insufficient balance';
  END IF;
  
  -- Deduct entry fee from user (always charge for each attempt)
  UPDATE profiles
  SET balance = balance - v_entry_fee,
      updated_at = now()
  WHERE id = p_user_id;
  
  -- Update game stats (increment current players and prize pool for each entry)
  UPDATE restaurant_games
  SET current_players = current_players + 1,
      prize_pool = prize_pool + v_entry_fee
  WHERE id = p_game_id;
  
  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update the submit_restaurant_game_score function to handle multiple entries
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
  v_entry_number integer;
  v_game_status text;
BEGIN
  -- Get game details
  SELECT min_score, current_players, max_players, status
  INTO v_min_score, v_current_players, v_max_players, v_game_status
  FROM restaurant_games
  WHERE id = p_game_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Game not found';
  END IF;
  
  -- Check if game is still active
  IF v_game_status != 'active' THEN
    RAISE EXCEPTION 'Game is no longer active';
  END IF;
  
  -- Get the next entry number for this user
  SELECT COALESCE(MAX(entry_number), 0) + 1 INTO v_entry_number
  FROM restaurant_game_entries
  WHERE game_id = p_game_id AND user_id = p_user_id;
  
  -- Insert the score entry
  INSERT INTO restaurant_game_entries (game_id, user_id, score, entry_number)
  VALUES (p_game_id, p_user_id, p_score, v_entry_number);
  
  -- Count total entries (not unique users)
  SELECT COUNT(*) INTO v_entry_count
  FROM restaurant_game_entries
  WHERE game_id = p_game_id;
  
  -- Check if all slots are filled (based on current_players from game)
  IF v_entry_count >= v_max_players THEN
    -- Find the winner (highest score across all entries)
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
    'max_players', v_max_players,
    'entry_number', v_entry_number
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to get user's best score for a specific game
CREATE OR REPLACE FUNCTION get_user_best_score_for_game(
  p_game_id uuid,
  p_user_id uuid
)
RETURNS integer AS $$
DECLARE
  v_best_score integer;
BEGIN
  SELECT COALESCE(MAX(score), 0) INTO v_best_score
  FROM restaurant_game_entries
  WHERE game_id = p_game_id AND user_id = p_user_id;
  
  RETURN v_best_score;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION get_user_best_score_for_game TO authenticated;

-- Create index for better performance on multiple entries
CREATE INDEX IF NOT EXISTS idx_restaurant_game_entries_game_user ON restaurant_game_entries(game_id, user_id);
CREATE INDEX IF NOT EXISTS idx_restaurant_game_entries_entry_number ON restaurant_game_entries(entry_number);