/*
  # Add Emoji Column to Restaurant Games

  1. Database Changes
    - Add emoji column to restaurant_games table
    - Set default emoji to 🍔 (hamburger)
    - Update existing games to have default emoji

  2. Purpose
    - Replace image uploads with simple emoji selection
    - Improve performance and simplify UI
    - Maintain visual appeal with food-themed emojis
*/

-- Add emoji column to restaurant_games table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'restaurant_games' AND column_name = 'emoji'
  ) THEN
    ALTER TABLE restaurant_games ADD COLUMN emoji text DEFAULT '🍔';
  END IF;
END $$;

-- Update existing games to have default emoji
UPDATE restaurant_games 
SET emoji = '🍔' 
WHERE emoji IS NULL;

-- Update the create_restaurant_game function to accept emoji parameter
CREATE OR REPLACE FUNCTION create_restaurant_game(
  p_restaurant_id uuid,
  p_name text,
  p_description text,
  p_entry_fee decimal,
  p_max_players integer,
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
  
  -- Create the game
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
    p_max_players,
    p_min_score,
    p_game_type,
    p_emoji
  )
  RETURNING id INTO v_game_id;
  
  RETURN v_game_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION create_restaurant_game TO authenticated;

-- Create index for emoji column
CREATE INDEX IF NOT EXISTS idx_restaurant_games_emoji ON restaurant_games(emoji);