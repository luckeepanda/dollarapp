/*
  # Add Game Sessions and Participants Tables

  1. New Tables
    - `game_sessions`
      - `id` (uuid, primary key)
      - `game_type` (text) - type of game (e.g., 'taco_flyer')
      - `entry_fee` (decimal) - cost to join ($1.00)
      - `max_players` (integer) - maximum players (5)
      - `current_players` (integer) - current player count
      - `status` (enum) - waiting, active, completed
      - `prize_pool` (decimal) - total prize money
      - `started_at` (timestamp, nullable)
      - `completed_at` (timestamp, nullable)
      - `created_at` (timestamp)
    
    - `game_participants`
      - `id` (uuid, primary key)
      - `session_id` (uuid, foreign key)
      - `user_id` (uuid, foreign key)
      - `joined_at` (timestamp)
      - `final_score` (integer, nullable)
      - `qualified` (boolean, default false)
      - `prize_won` (decimal, nullable)

  2. Security
    - Enable RLS on both tables
    - Add policies for reading and joining sessions
    - Add policies for updating participant scores

  3. Functions
    - Function to join a game session with balance deduction
    - Function to start a game when max players reached
    - Function to complete a game and distribute prizes
*/

-- Create enum for game session status
CREATE TYPE game_session_status AS ENUM ('waiting', 'active', 'completed', 'cancelled');

-- Create game_sessions table
CREATE TABLE IF NOT EXISTS game_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  game_type text NOT NULL DEFAULT 'taco_flyer',
  entry_fee decimal(10,2) NOT NULL DEFAULT 1.00,
  max_players integer NOT NULL DEFAULT 5,
  current_players integer DEFAULT 0,
  status game_session_status DEFAULT 'waiting',
  prize_pool decimal(10,2) DEFAULT 0.00,
  min_score integer DEFAULT 5,
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Create game_participants table
CREATE TABLE IF NOT EXISTS game_participants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid REFERENCES game_sessions(id) ON DELETE CASCADE,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  joined_at timestamptz DEFAULT now(),
  final_score integer,
  qualified boolean DEFAULT false,
  prize_won decimal(10,2),
  UNIQUE(session_id, user_id)
);

-- Enable Row Level Security
ALTER TABLE game_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_participants ENABLE ROW LEVEL SECURITY;

-- Policies for game_sessions
CREATE POLICY "Anyone can read active game sessions"
  ON game_sessions
  FOR SELECT
  TO authenticated
  USING (status IN ('waiting', 'active'));

CREATE POLICY "System can manage game sessions"
  ON game_sessions
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Policies for game_participants
CREATE POLICY "Users can read own participation"
  ON game_participants
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can read participants in their sessions"
  ON game_participants
  FOR SELECT
  TO authenticated
  USING (
    session_id IN (
      SELECT session_id FROM game_participants WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own participation"
  ON game_participants
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "System can update participant data"
  ON game_participants
  FOR UPDATE
  TO authenticated
  USING (true);

-- Function to join a game session
CREATE OR REPLACE FUNCTION join_game_session(
  p_user_id uuid,
  p_game_type text DEFAULT 'taco_flyer'
)
RETURNS uuid AS $$
DECLARE
  v_session_id uuid;
  v_user_balance decimal;
  v_entry_fee decimal := 1.00;
  v_current_players integer;
  v_max_players integer;
BEGIN
  -- Check user balance
  SELECT balance INTO v_user_balance
  FROM profiles
  WHERE id = p_user_id;
  
  IF v_user_balance < v_entry_fee THEN
    RAISE EXCEPTION 'Insufficient balance. Required: $%.2f, Available: $%.2f', v_entry_fee, v_user_balance;
  END IF;
  
  -- Check if user is already in an active session
  SELECT session_id INTO v_session_id
  FROM game_participants gp
  JOIN game_sessions gs ON gp.session_id = gs.id
  WHERE gp.user_id = p_user_id 
    AND gs.status IN ('waiting', 'active');
  
  IF v_session_id IS NOT NULL THEN
    RETURN v_session_id; -- Return existing session
  END IF;
  
  -- Find or create a waiting session
  SELECT id, current_players, max_players INTO v_session_id, v_current_players, v_max_players
  FROM game_sessions
  WHERE game_type = p_game_type 
    AND status = 'waiting' 
    AND current_players < max_players
  ORDER BY created_at ASC
  LIMIT 1;
  
  -- Create new session if none available
  IF v_session_id IS NULL THEN
    INSERT INTO game_sessions (game_type, entry_fee, max_players, current_players, prize_pool)
    VALUES (p_game_type, v_entry_fee, 5, 0, 0.00)
    RETURNING id INTO v_session_id;
    
    v_current_players := 0;
    v_max_players := 5;
  END IF;
  
  -- Deduct balance from user
  UPDATE profiles
  SET balance = balance - v_entry_fee,
      updated_at = now()
  WHERE id = p_user_id;
  
  -- Add user to session
  INSERT INTO game_participants (session_id, user_id)
  VALUES (v_session_id, p_user_id);
  
  -- Update session player count and prize pool
  UPDATE game_sessions
  SET current_players = current_players + 1,
      prize_pool = prize_pool + v_entry_fee
  WHERE id = v_session_id;
  
  -- Check if session is full and start it
  IF v_current_players + 1 >= v_max_players THEN
    UPDATE game_sessions
    SET status = 'active',
        started_at = now()
    WHERE id = v_session_id;
  END IF;
  
  RETURN v_session_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to submit game score
CREATE OR REPLACE FUNCTION submit_game_score(
  p_session_id uuid,
  p_user_id uuid,
  p_score integer
)
RETURNS boolean AS $$
DECLARE
  v_min_score integer;
  v_qualified boolean := false;
BEGIN
  -- Get minimum score for qualification
  SELECT min_score INTO v_min_score
  FROM game_sessions
  WHERE id = p_session_id;
  
  -- Determine if player qualified
  v_qualified := p_score >= v_min_score;
  
  -- Update participant score
  UPDATE game_participants
  SET final_score = p_score,
      qualified = v_qualified
  WHERE session_id = p_session_id 
    AND user_id = p_user_id;
  
  RETURN v_qualified;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to complete game session and distribute prizes
CREATE OR REPLACE FUNCTION complete_game_session(p_session_id uuid)
RETURNS void AS $$
DECLARE
  v_prize_pool decimal;
  v_qualified_count integer;
  v_prize_per_winner decimal;
  participant_record RECORD;
BEGIN
  -- Get session details
  SELECT prize_pool INTO v_prize_pool
  FROM game_sessions
  WHERE id = p_session_id;
  
  -- Count qualified participants
  SELECT COUNT(*) INTO v_qualified_count
  FROM game_participants
  WHERE session_id = p_session_id AND qualified = true;
  
  -- Distribute prizes if there are qualified winners
  IF v_qualified_count > 0 THEN
    v_prize_per_winner := v_prize_pool / v_qualified_count;
    
    -- Update winners and add to their balance
    FOR participant_record IN
      SELECT user_id FROM game_participants
      WHERE session_id = p_session_id AND qualified = true
    LOOP
      -- Update participant prize
      UPDATE game_participants
      SET prize_won = v_prize_per_winner
      WHERE session_id = p_session_id AND user_id = participant_record.user_id;
      
      -- Add prize to user balance
      UPDATE profiles
      SET balance = balance + v_prize_per_winner,
          updated_at = now()
      WHERE id = participant_record.user_id;
    END LOOP;
  END IF;
  
  -- Mark session as completed
  UPDATE game_sessions
  SET status = 'completed',
      completed_at = now()
  WHERE id = p_session_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION join_game_session TO authenticated;
GRANT EXECUTE ON FUNCTION submit_game_score TO authenticated;
GRANT EXECUTE ON FUNCTION complete_game_session TO authenticated;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_game_sessions_status ON game_sessions(status);
CREATE INDEX IF NOT EXISTS idx_game_sessions_game_type ON game_sessions(game_type);
CREATE INDEX IF NOT EXISTS idx_game_participants_session_id ON game_participants(session_id);
CREATE INDEX IF NOT EXISTS idx_game_participants_user_id ON game_participants(user_id);