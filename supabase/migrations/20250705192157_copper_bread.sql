/*
  # Tournament Winner System

  1. New Tables
    - `tournaments`
      - `id` (uuid, primary key)
      - `name` (text)
      - `entry_fee` (decimal)
      - `max_participants` (integer, default 5)
      - `current_participants` (integer, default 0)
      - `status` (enum: active, completed)
      - `winner_id` (uuid, foreign key, nullable)
      - `winning_score` (integer, nullable)
      - `started_at` (timestamp)
      - `completed_at` (timestamp, nullable)
      - `created_at` (timestamp)
    
    - `tournament_entries`
      - `id` (uuid, primary key)
      - `tournament_id` (uuid, foreign key)
      - `user_id` (uuid, foreign key)
      - `score` (integer)
      - `completed_at` (timestamp)
      - `created_at` (timestamp)

  2. Functions
    - Function to join tournament
    - Function to submit score and check for winner
    - Function to get tournament results

  3. Security
    - Enable RLS on both tables
    - Add appropriate policies
*/

-- Create tournament status enum
CREATE TYPE tournament_status AS ENUM ('active', 'completed');

-- Create tournaments table
CREATE TABLE IF NOT EXISTS tournaments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  entry_fee decimal(10,2) NOT NULL DEFAULT 1.00,
  max_participants integer NOT NULL DEFAULT 5,
  current_participants integer DEFAULT 0,
  status tournament_status DEFAULT 'active',
  winner_id uuid REFERENCES profiles(id),
  winning_score integer,
  started_at timestamptz DEFAULT now(),
  completed_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Create tournament_entries table
CREATE TABLE IF NOT EXISTS tournament_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id uuid REFERENCES tournaments(id) ON DELETE CASCADE,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  score integer NOT NULL,
  completed_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  UNIQUE(tournament_id, user_id)
);

-- Enable Row Level Security
ALTER TABLE tournaments ENABLE ROW LEVEL SECURITY;
ALTER TABLE tournament_entries ENABLE ROW LEVEL SECURITY;

-- Policies for tournaments
CREATE POLICY "Anyone can read tournaments"
  ON tournaments
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "System can manage tournaments"
  ON tournaments
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Policies for tournament_entries
CREATE POLICY "Anyone can read tournament entries"
  ON tournament_entries
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert own entries"
  ON tournament_entries
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "System can update entries"
  ON tournament_entries
  FOR UPDATE
  TO authenticated
  USING (true);

-- Function to join tournament
CREATE OR REPLACE FUNCTION join_tournament(p_user_id uuid)
RETURNS uuid AS $$
DECLARE
  v_tournament_id uuid;
  v_user_balance decimal;
  v_entry_fee decimal := 1.00;
  v_current_participants integer;
BEGIN
  -- Check user balance
  SELECT balance INTO v_user_balance
  FROM profiles
  WHERE id = p_user_id;
  
  IF v_user_balance < v_entry_fee THEN
    RAISE EXCEPTION 'Insufficient balance. Required: $%.2f, Available: $%.2f', v_entry_fee, v_user_balance;
  END IF;
  
  -- Find active tournament with space
  SELECT id, current_participants INTO v_tournament_id, v_current_participants
  FROM tournaments
  WHERE status = 'active' 
    AND current_participants < max_participants
    AND id NOT IN (
      SELECT tournament_id FROM tournament_entries WHERE user_id = p_user_id
    )
  ORDER BY created_at ASC
  LIMIT 1;
  
  -- Create new tournament if none available
  IF v_tournament_id IS NULL THEN
    INSERT INTO tournaments (name, entry_fee, max_participants, current_participants)
    VALUES ('Taco Flyer Tournament', v_entry_fee, 5, 0)
    RETURNING id INTO v_tournament_id;
    
    v_current_participants := 0;
  END IF;
  
  -- Deduct balance from user
  UPDATE profiles
  SET balance = balance - v_entry_fee,
      updated_at = now()
  WHERE id = p_user_id;
  
  -- Update tournament participant count
  UPDATE tournaments
  SET current_participants = current_participants + 1
  WHERE id = v_tournament_id;
  
  RETURN v_tournament_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to submit tournament score and check for winner
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
    'entries_count', v_entry_count,
    'max_participants', v_max_participants
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get tournament results
CREATE OR REPLACE FUNCTION get_tournament_results(p_tournament_id uuid)
RETURNS TABLE (
  user_id uuid,
  username text,
  score integer,
  rank integer,
  is_winner boolean,
  completed_at timestamptz
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    te.user_id,
    p.username,
    te.score,
    ROW_NUMBER() OVER (ORDER BY te.score DESC, te.completed_at ASC)::integer as rank,
    (te.user_id = t.winner_id) as is_winner,
    te.completed_at
  FROM tournament_entries te
  JOIN profiles p ON te.user_id = p.id
  JOIN tournaments t ON te.tournament_id = t.id
  WHERE te.tournament_id = p_tournament_id
  ORDER BY te.score DESC, te.completed_at ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION join_tournament TO authenticated;
GRANT EXECUTE ON FUNCTION submit_tournament_score TO authenticated;
GRANT EXECUTE ON FUNCTION get_tournament_results TO authenticated;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_tournaments_status ON tournaments(status);
CREATE INDEX IF NOT EXISTS idx_tournaments_created_at ON tournaments(created_at);
CREATE INDEX IF NOT EXISTS idx_tournament_entries_tournament_id ON tournament_entries(tournament_id);
CREATE INDEX IF NOT EXISTS idx_tournament_entries_score ON tournament_entries(score DESC);
CREATE INDEX IF NOT EXISTS idx_tournament_entries_user_id ON tournament_entries(user_id);

-- Create a sample active tournament
INSERT INTO tournaments (name, entry_fee, max_participants, current_participants, status)
VALUES ('Taco Flyer Championship', 1.00, 5, 0, 'active');