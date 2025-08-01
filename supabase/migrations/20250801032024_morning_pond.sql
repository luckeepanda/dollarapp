/*
  # Fix Game Qualification Logic

  1. Database Changes
    - Update restaurant game score submission to always qualify players
    - Update tournament score submission to always qualify players
    - Remove min_score checks in qualification logic
    - Ensure any score (including 0) qualifies for prizes

  2. Functions Updated
    - submit_restaurant_game_score: Remove min_score qualification check
    - submit_tournament_score: Remove min_score qualification check
    - submit_game_score: Remove min_score qualification check

  3. Logic Changes
    - qualified = true (always qualify)
    - Winner determination based on highest score only
    - Any participation counts as qualification
*/

-- Update submit_restaurant_game_score to always qualify players
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
   
    -- Get updated prize pool after completion
    SELECT prize_pool INTO v_prize_pool
    FROM restaurant_games
    WHERE id = p_game_id;
  END IF;
  
  RETURN jsonb_build_object(
    'game_completed', v_game_completed,
    'winner_id', v_winner_id,
    'winning_score', v_winning_score,
    'qr_code', v_qr_code,
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

-- Update submit_tournament_score to always qualify players
CREATE OR REPLACE FUNCTION submit_tournament_score(
  p_tournament_id uuid,
  p_user_id uuid,
  p_score integer
)
RETURNS jsonb AS $$
DECLARE
  v_entry_count integer;
  v_max_participants integer;
  v_winner_id uuid;
  v_winning_score integer;
  v_tournament_completed boolean := false;
  v_qualified boolean := true; -- Always qualify regardless of score
BEGIN
  -- Insert the score
  INSERT INTO tournament_entries (tournament_id, user_id, score)
  VALUES (p_tournament_id, p_user_id, p_score)
  ON CONFLICT (tournament_id, user_id) 
  DO UPDATE SET score = p_score, completed_at = now();
  
  -- Get tournament info
  SELECT max_participants INTO v_max_participants
  FROM tournaments
  WHERE id = p_tournament_id;
  
  -- Count current entries
  SELECT COUNT(*) INTO v_entry_count
  FROM tournament_entries
  WHERE tournament_id = p_tournament_id;
  
  -- Check if tournament is complete (5 players have played)
  IF v_entry_count >= v_max_participants THEN
    -- Find the winner (highest score)
    SELECT user_id, score INTO v_winner_id, v_winning_score
    FROM tournament_entries
    WHERE tournament_id = p_tournament_id
    ORDER BY score DESC, completed_at ASC
    LIMIT 1;
    
    -- Update tournament with winner
    UPDATE tournaments
    SET status = 'completed',
        winner_id = v_winner_id,
        winning_score = v_winning_score,
        completed_at = now()
    WHERE id = p_tournament_id;
    
    v_tournament_completed := true;
  END IF;
  
  -- Return result
  RETURN jsonb_build_object(
    'tournament_completed', v_tournament_completed,
    'winner_id', v_winner_id,
    'winning_score', v_winning_score,
    'your_score', p_score,
    'qualified', v_qualified, -- Always true now
    'entries_count', v_entry_count,
    'max_participants', v_max_participants
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update submit_game_score to always qualify players
CREATE OR REPLACE FUNCTION submit_game_score(
  p_session_id uuid,
  p_user_id uuid,
  p_score integer
)
RETURNS boolean AS $$
DECLARE
  v_qualified boolean := true; -- Always qualify regardless of score
BEGIN
  -- Update participant score and mark as played
  UPDATE game_participants
  SET final_score = p_score,
      qualified = v_qualified,
      has_played = true
  WHERE session_id = p_session_id 
    AND user_id = p_user_id;
  
  -- Mark session as completed since it's single player
  UPDATE game_sessions
  SET status = 'completed',
      completed_at = now()
  WHERE id = p_session_id;
  
  RETURN v_qualified; -- Always true now
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION submit_restaurant_game_score TO authenticated;
GRANT EXECUTE ON FUNCTION submit_tournament_score TO authenticated;
GRANT EXECUTE ON FUNCTION submit_game_score TO authenticated;