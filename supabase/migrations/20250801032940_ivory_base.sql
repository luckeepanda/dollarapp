/*
  # Fix Winner QR Code Creation for Restaurant Games

  1. Database Changes
    - Update submit_restaurant_game_score function to create QR codes in player_qr_codes table
    - Ensure winners get QR codes that appear in their player dashboard
    - Maintain existing restaurant_games QR code for restaurant scanning

  2. Logic Changes
    - When game completes and winner is determined, create entry in player_qr_codes
    - Use the existing create_restaurant_game_qr_code function
    - Ensure QR codes are visible to players in their dashboard

  3. Security
    - Maintain existing RLS policies
    - Ensure proper QR code generation and tracking
*/

-- Update submit_restaurant_game_score to create QR codes in player_qr_codes table
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
  v_game_name text;
  v_prize_pool decimal;
  v_qualified boolean := true; -- Always qualify regardless of score
  v_player_qr_code text;
BEGIN
  -- Get game details
  SELECT min_score, current_players, max_players, status, name, prize_pool
  INTO v_min_score, v_current_players, v_max_players, v_game_status, v_game_name, v_prize_pool
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
    
    -- Generate unique QR code for restaurant_games table (for restaurant scanning)
    v_qr_code := 'RG-' || upper(substring(gen_random_uuid()::text from 1 for 8));
    
    -- Update game with winner and QR code
    UPDATE restaurant_games
    SET status = 'completed',
        winner_id = v_winner_id,
        winning_score = v_winning_score,
        qr_code = v_qr_code,
        completed_at = now()
    WHERE id = p_game_id;
    
    -- Create QR code in player_qr_codes table for the winner's dashboard
    SELECT create_restaurant_game_qr_code(
      v_winner_id,
      p_game_id,
      v_game_name,
      v_prize_pool
    ) INTO v_player_qr_code;
    
    v_game_completed := true;
   
    -- Get updated prize pool after completion
    SELECT prize_pool INTO v_prize_pool
    FROM restaurant_games
    WHERE id = p_game_id;
  END IF;
  
  RETURN jsonb_build_object(
    'game_completed', v_game_completed,
    'winner_id', v_winner_id,
    'winning_score', v_winning_score,
    'qr_code', v_player_qr_code, -- Return the player QR code, not the restaurant one
    'your_score', p_score,
    'qualified', v_qualified, -- Always true now
    'entries_count', v_entry_count,
    'max_players', v_max_players,
    'entry_number', v_entry_number,
    'game_name', v_game_name,
    'prize_pool', v_prize_pool
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION submit_restaurant_game_score TO authenticated;