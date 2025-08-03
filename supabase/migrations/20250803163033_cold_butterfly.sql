/*
  # Add Game Images Support

  1. Database Changes
    - Add image_url column to restaurant_games table
    - Store Supabase storage URLs for game images
    - Default to null for games without custom images

  2. Storage
    - Images will be stored in Supabase storage bucket 'game-images'
    - File naming convention: {restaurant_id}/{game_id}/{timestamp}
*/

-- Add image_url column to restaurant_games table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'restaurant_games' AND column_name = 'image_url'
  ) THEN
    ALTER TABLE restaurant_games ADD COLUMN image_url text;
  END IF;
END $$;

-- Update the create_restaurant_game function to accept image_url parameter
CREATE OR REPLACE FUNCTION create_restaurant_game(
  p_restaurant_id uuid,
  p_name text,
  p_description text,
  p_entry_fee decimal,
  p_max_players integer,
  p_min_score integer DEFAULT 0,
  p_game_type text DEFAULT 'taco_flyer',
  p_image_url text DEFAULT null
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
    image_url
  )
  VALUES (
    p_restaurant_id,
    p_name,
    p_description,
    p_entry_fee,
    p_max_players,
    p_min_score,
    p_game_type,
    p_image_url
  )
  RETURNING id INTO v_game_id;
  
  RETURN v_game_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION create_restaurant_game TO authenticated;

-- Create index for image URLs
CREATE INDEX IF NOT EXISTS idx_restaurant_games_image_url ON restaurant_games(image_url);