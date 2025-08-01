/*
  # Update Minimum Score Default to 0

  1. Database Changes
    - Update default min_score to 0 for game_sessions table
    - Update existing active games to have min_score of 0
    - Update restaurant_games default min_score to 0
    - Update existing active restaurant games to have min_score of 0

  2. Purpose
    - Make all games more accessible by removing score barriers
    - Any score qualifies for prizes
    - Focus on participation rather than skill barriers
*/

-- Update game_sessions table default
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'game_sessions' AND column_name = 'min_score'
  ) THEN
    ALTER TABLE game_sessions ALTER COLUMN min_score SET DEFAULT 0;
  END IF;
END $$;

-- Update existing active game sessions
UPDATE game_sessions 
SET min_score = 0 
WHERE status IN ('waiting', 'active');

-- Update restaurant_games table - add min_score column if it doesn't exist with default 0
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'restaurant_games' AND column_name = 'min_score'
  ) THEN
    ALTER TABLE restaurant_games ADD COLUMN min_score integer DEFAULT 0;
  ELSE
    -- Update default if column exists
    ALTER TABLE restaurant_games ALTER COLUMN min_score SET DEFAULT 0;
  END IF;
END $$;

-- Update existing active restaurant games
UPDATE restaurant_games 
SET min_score = 0 
WHERE status = 'active';

-- Update the create_restaurant_game function to use 0 as default
CREATE OR REPLACE FUNCTION create_restaurant_game(
  p_restaurant_id uuid,
  p_name text,
  p_description text,
  p_entry_fee decimal,
  p_max_players integer,
  p_min_score integer DEFAULT 0,
  p_game_type text DEFAULT 'taco_flyer'
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
    min_score,
    game_type
  )
  VALUES (
    p_restaurant_id,
    p_name,
    p_description,
    p_entry_fee,
    p_max_players,
    p_min_score,
    p_game_type
  )
  RETURNING id INTO v_game_id;
  
  RETURN v_game_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION create_restaurant_game TO authenticated;