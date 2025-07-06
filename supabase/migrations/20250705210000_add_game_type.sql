# Add game_type column to restaurant_games table

  1. Changes
    - Add game_type column to restaurant_games table
    - Set default value to 'taco_flyer'
    - Update existing records to have 'taco_flyer' as game type
    - Update create_restaurant_game function to accept game_type parameter

  2. Security
    - Maintain existing RLS policies
    - No changes to security model
*/

-- Add game_type column to restaurant_games table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'restaurant_games' AND column_name = 'game_type'
  ) THEN
    ALTER TABLE restaurant_games ADD COLUMN game_type text DEFAULT 'taco_flyer';
  END IF;
END $$;

-- Update existing records to have 'taco_flyer' as game type
UPDATE restaurant_games SET game_type = 'taco_flyer' WHERE game_type IS NULL;

-- Update the create_restaurant_game function to accept game_type parameter
CREATE OR REPLACE FUNCTION create_restaurant_game(
  p_restaurant_id uuid,
  p_name text,
  p_description text,
  p_entry_fee decimal,
  p_max_players integer,
  p_min_score integer,
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