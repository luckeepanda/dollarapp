/*
  # Create Leaderboard Table

  1. New Tables
    - `leaderboard`
      - `id` (uuid, primary key)
      - `nickname` (text)
      - `score` (integer)
      - `user_id` (uuid, foreign key, nullable for anonymous players)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on leaderboard table
    - Add policies for reading and inserting leaderboard entries
    - Allow public read access for leaderboard display
    - Allow authenticated and anonymous users to insert entries

  3. Indexes
    - Add index on score for efficient leaderboard queries
    - Add index on created_at for time-based queries
*/

-- Create leaderboard table
CREATE TABLE IF NOT EXISTS leaderboard (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nickname text NOT NULL,
  score integer NOT NULL,
  user_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE leaderboard ENABLE ROW LEVEL SECURITY;

-- Create policies for leaderboard access
CREATE POLICY "Anyone can read leaderboard"
  ON leaderboard
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Anyone can insert leaderboard entries"
  ON leaderboard
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_leaderboard_score ON leaderboard(score DESC);
CREATE INDEX IF NOT EXISTS idx_leaderboard_created_at ON leaderboard(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_leaderboard_user_id ON leaderboard(user_id);

-- Insert some sample leaderboard data
INSERT INTO leaderboard (nickname, score, created_at) VALUES
('TacoMaster', 45, now() - interval '2 days'),
('FlightPro', 38, now() - interval '1 day'),
('GameWiz', 32, now() - interval '3 hours'),
('TacoFan', 28, now() - interval '5 hours'),
('SkyFlyer', 25, now() - interval '1 hour'),
('FoodLover', 22, now() - interval '30 minutes'),
('QuickTaco', 18, now() - interval '15 minutes'),
('AcePilot', 15, now() - interval '10 minutes'),
('TacoRun', 12, now() - interval '5 minutes'),
('NewPlayer', 8, now() - interval '2 minutes');