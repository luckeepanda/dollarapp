/*
  # Update Restaurant Games to Single Player Model

  1. Database Changes
    - Update existing restaurant games to be single player (max_players = 1)
    - Reset current_players to 0 for active games
    - Update create_restaurant_game function to default to single player
    - Update join_restaurant_game function for single player logic

  2. Game Logic Changes
    - Remove multi-player competition logic
    - Focus on minimum score achievement
    - Immediate game completion after single play
    - QR code generation based on score achievement

  3. Functions Updated
    - create_restaurant_game: Default max_players to 1
    - join_restaurant_game: Remove player count checks
    - submit_restaurant_game_score: Immediate completion logic
*/

-- Update existing active games to be single player
UPDATE restaurant_games 
SET max_players = 1,
    current_players = 0
WHERE status = 'active';

-- Update create_restaurant_game function for single player default
CREATE OR REPLACE FUNCTION create_restaurant_game(
  p_restaurant_id uuid,
  p_name text,
  p_description text,
  p_entry_fee decimal,
  p_max_players integer DEFAULT 1,
  p_min_score integer DEFAULT 0,
  p_game_type text DEFAULT 'taco_flyer',
  p_emoji text DEFAULT '🍔'
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
  
  -- Create the game (force single player)
  INSERT INTO restaurant_games (
    restaurant_id, 
    name, 
    description, 
    entry_fee, 
    max_players, 
    min_score,
    game_type,
    emoji
  )
  VALUES (
    p_restaurant_id,
    p_name,
    p_description,
    p_entry_fee,
    1, -- Always single player
    p_min_score,
    p_game_type,
    p_emoji
  )
  RETURNING id INTO v_game_id;
  
  RETURN v_game_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update join_restaurant_game function for single player logic
CREATE OR REPLACE FUNCTION join_restaurant_game(
  p_game_id uuid,
  p_user_id uuid
)
RETURNS boolean AS $$
DECLARE
  v_entry_fee decimal;
  v_user_balance decimal;
  v_game_status text;
BEGIN
  -- Get game details
  SELECT entry_fee, status
  INTO v_entry_fee, v_game_status
  FROM restaurant_games
  WHERE id = p_game_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Game not found';
  END IF;
  
  -- Check if game is still active
  IF v_game_status != 'active' THEN
    RAISE EXCEPTION 'Game is no longer active';
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
  
  -- Update game stats (single entry)
  UPDATE restaurant_games
  SET current_players = 1,
      prize_pool = v_entry_fee
  WHERE id = p_game_id;
  
  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update submit_restaurant_game_score for single player immediate completion
CREATE OR REPLACE FUNCTION submit_restaurant_game_score(
  p_game_id uuid,
  p_user_id uuid,
  p_score integer
)
RETURNS jsonb AS $$
DECLARE
  v_min_score integer;
  v_game_status text;
  v_game_name text;
  v_prize_pool decimal;
  v_qualified boolean;
  v_qr_code text;
BEGIN
  -- Get game details
  SELECT min_score, status, name, prize_pool
  INTO v_min_score, v_game_status, v_game_name, v_prize_pool
  FROM restaurant_games
  WHERE id = p_game_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Game not found';
  END IF;
  
  -- Check if game is still active
  IF v_game_status != 'active' THEN
    RAISE EXCEPTION 'Game is no longer active';
  END IF;
  
  -- Check if player qualifies
  v_qualified := p_score >= v_min_score;
  
  -- Insert the score entry
  INSERT INTO restaurant_game_entries (game_id, user_id, score, entry_number)
  VALUES (p_game_id, p_user_id, p_score, 1);
  
  -- Complete the game immediately (single player)
  IF v_qualified THEN
    -- Generate unique QR code for qualifying player
    v_qr_code := 'RG-' || upper(substring(gen_random_uuid()::text from 1 for 8));
    
    -- Update game as completed with winner
    UPDATE restaurant_games
    SET status = 'completed',
        winner_id = p_user_id,
        winning_score = p_score,
        qr_code = v_qr_code,
        completed_at = now()
    WHERE id = p_game_id;
  ELSE
    -- Mark game as completed but no winner
    UPDATE restaurant_games
    SET status = 'completed',
        winning_score = p_score,
        completed_at = now()
    WHERE id = p_game_id;
  END IF;
  
  RETURN jsonb_build_object(
    'game_completed', true,
    'winner_id', CASE WHEN v_qualified THEN p_user_id ELSE null END,
    'winning_score', p_score,
    'qr_code', CASE WHEN v_qualified THEN v_qr_code ELSE null END,
    'your_score', p_score,
    'qualified', v_qualified,
    'entries_count', 1,
    'max_players', 1,
    'entry_number', 1,
    'game_name', v_game_name,
    'prize_pool', v_prize_pool,
    'min_score_required', v_min_score
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION create_restaurant_game TO authenticated;
GRANT EXECUTE ON FUNCTION join_restaurant_game TO authenticated;
GRANT EXECUTE ON FUNCTION submit_restaurant_game_score TO authenticated;