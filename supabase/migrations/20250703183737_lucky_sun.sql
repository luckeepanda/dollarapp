/*
  # Simplified Tournament System

  1. Database Changes
    - Add has_played column to game_participants
    - Create simplified tournament functions
    - Update tournament flow to be immediate play

  2. Functions
    - join_tournament_game: Simple $1 deduction and session creation
    - submit_tournament_score: Record score and mark as played
    - check_tournament_complete: Check if tournament is done

  3. Tournament Flow
    - Player pays $1 and immediately starts playing
    - Score is submitted to tournament leaderboard
    - No waiting rooms or complex session management
*/

-- Add has_played column to track if participant has completed their game
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'game_participants' AND column_name = 'has_played'
  ) THEN
    ALTER TABLE game_participants ADD COLUMN has_played boolean DEFAULT false;
  END IF;
END $$;

-- Simplified function to join tournament (immediate play)
CREATE OR REPLACE FUNCTION join_tournament_game(
  p_user_id uuid,
  p_game_type text DEFAULT 'taco_flyer'
)
RETURNS uuid AS $$
DECLARE
  v_session_id uuid;
  v_user_balance decimal;
  v_entry_fee decimal := 1.00;
BEGIN
  -- Check user balance
  SELECT balance INTO v_user_balance
  FROM profiles
  WHERE id = p_user_id;
  
  IF v_user_balance < v_entry_fee THEN
    RAISE EXCEPTION 'Insufficient balance. Required: $%.2f, Available: $%.2f', v_entry_fee, v_user_balance;
  END IF;
  
  -- Deduct balance from user
  UPDATE profiles
  SET balance = balance - v_entry_fee,
      updated_at = now()
  WHERE id = p_user_id;
  
  -- Create new tournament session for this player
  INSERT INTO game_sessions (game_type, entry_fee, max_players, current_players, prize_pool, status)
  VALUES (p_game_type, v_entry_fee, 1, 1, v_entry_fee, 'active')
  RETURNING id INTO v_session_id;
  
  -- Add user to session
  INSERT INTO game_participants (session_id, user_id, has_played)
  VALUES (v_session_id, p_user_id, false);
  
  RETURN v_session_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to submit tournament score
CREATE OR REPLACE FUNCTION submit_tournament_score(
  p_session_id uuid,
  p_user_id uuid,
  p_score integer
)
RETURNS boolean AS $$
DECLARE
  v_qualified boolean := true; -- In tournament mode, all scores count
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
  
  RETURN v_qualified;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if tournament is complete (always true for single player)
CREATE OR REPLACE FUNCTION check_tournament_complete(p_session_id uuid)
RETURNS boolean AS $$
DECLARE
  v_session_status text;
BEGIN
  SELECT status INTO v_session_status
  FROM game_sessions
  WHERE id = p_session_id;
  
  RETURN v_session_status = 'completed';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION join_tournament_game TO authenticated;
GRANT EXECUTE ON FUNCTION submit_tournament_score TO authenticated;
GRANT EXECUTE ON FUNCTION check_tournament_complete TO authenticated;