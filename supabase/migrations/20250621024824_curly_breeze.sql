/*
  # Initial Dollar App Database Schema

  1. New Tables
    - `users`
      - `id` (uuid, primary key, references auth.users)
      - `email` (text, unique)
      - `username` (text, unique)
      - `account_type` (enum: player, restaurant)
      - `balance` (decimal)
      - `is_kyc_verified` (boolean, nullable for players)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `games`
      - `id` (uuid, primary key)
      - `name` (text)
      - `description` (text)
      - `prize_pool` (decimal)
      - `max_players` (integer)
      - `current_players` (integer)
      - `min_score` (integer)
      - `difficulty` (enum)
      - `category` (text)
      - `ends_at` (timestamp)
      - `is_active` (boolean)
      - `created_at` (timestamp)
    
    - `game_entries`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key)
      - `game_id` (uuid, foreign key)
      - `score` (integer)
      - `qualified` (boolean)
      - `created_at` (timestamp)
    
    - `qr_codes`
      - `id` (uuid, primary key)
      - `code` (text, unique)
      - `user_id` (uuid, foreign key)
      - `game_id` (uuid, foreign key)
      - `amount` (decimal)
      - `is_redeemed` (boolean)
      - `redeemed_by` (uuid, foreign key, nullable)
      - `redeemed_at` (timestamp, nullable)
      - `created_at` (timestamp)
    
    - `transactions`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key)
      - `type` (enum: deposit, withdrawal, game_entry, prize_win)
      - `amount` (decimal)
      - `status` (enum: pending, completed, failed)
      - `payment_method` (text, nullable)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for user data access
    - Add policies for game participation
    - Add policies for QR code redemption

  3. Functions
    - Balance management functions
    - Game player count functions
*/

-- Create custom types
CREATE TYPE account_type AS ENUM ('player', 'restaurant');
CREATE TYPE game_difficulty AS ENUM ('Easy', 'Medium', 'Hard');
CREATE TYPE transaction_type AS ENUM ('deposit', 'withdrawal', 'game_entry', 'prize_win');
CREATE TYPE transaction_status AS ENUM ('pending', 'completed', 'failed');

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  username text UNIQUE NOT NULL,
  account_type account_type NOT NULL,
  balance decimal(10,2) DEFAULT 0.00,
  is_kyc_verified boolean,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Games table
CREATE TABLE IF NOT EXISTS games (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL,
  prize_pool decimal(10,2) DEFAULT 0.00,
  max_players integer NOT NULL,
  current_players integer DEFAULT 0,
  min_score integer NOT NULL,
  difficulty game_difficulty NOT NULL,
  category text NOT NULL,
  ends_at timestamptz NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Game entries table
CREATE TABLE IF NOT EXISTS game_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  game_id uuid REFERENCES games(id) ON DELETE CASCADE,
  score integer DEFAULT 0,
  qualified boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, game_id)
);

-- QR codes table
CREATE TABLE IF NOT EXISTS qr_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  game_id uuid REFERENCES games(id) ON DELETE CASCADE,
  amount decimal(10,2) NOT NULL,
  is_redeemed boolean DEFAULT false,
  redeemed_by uuid REFERENCES users(id),
  redeemed_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  type transaction_type NOT NULL,
  amount decimal(10,2) NOT NULL,
  status transaction_status DEFAULT 'pending',
  payment_method text,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE games ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE qr_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can read own data"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own data"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Games policies
CREATE POLICY "Anyone can read active games"
  ON games
  FOR SELECT
  TO authenticated
  USING (is_active = true);

-- Game entries policies
CREATE POLICY "Users can read own game entries"
  ON game_entries
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own game entries"
  ON game_entries
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own game entries"
  ON game_entries
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- QR codes policies
CREATE POLICY "Users can read own QR codes"
  ON qr_codes
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id OR auth.uid() = redeemed_by);

CREATE POLICY "System can insert QR codes"
  ON qr_codes
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Restaurants can update QR codes for redemption"
  ON qr_codes
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.account_type = 'restaurant'
    )
  );

-- Transactions policies
CREATE POLICY "Users can read own transactions"
  ON transactions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own transactions"
  ON transactions
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Helper functions
CREATE OR REPLACE FUNCTION add_balance(user_id uuid, amount decimal)
RETURNS void AS $$
BEGIN
  UPDATE users 
  SET balance = balance + amount,
      updated_at = now()
  WHERE id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION deduct_balance(user_id uuid, amount decimal)
RETURNS void AS $$
BEGIN
  UPDATE users 
  SET balance = balance - amount,
      updated_at = now()
  WHERE id = user_id
  AND balance >= amount;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Insufficient balance';
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION increment_game_players(game_id uuid)
RETURNS void AS $$
BEGIN
  UPDATE games 
  SET current_players = current_players + 1
  WHERE id = game_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Insert sample games
INSERT INTO games (name, description, prize_pool, max_players, min_score, difficulty, category, ends_at) VALUES
('Taco Flyer Challenge', 'Guide the taco through obstacles to win lunch!', 127.50, 100, 5, 'Easy', 'Lunch', now() + interval '2 hours 15 minutes'),
('Dinner Taco Battle', 'Premium dinner experience for high scorers', 234.75, 200, 10, 'Medium', 'Dinner', now() + interval '4 hours 30 minutes'),
('Weekend Taco Festival', 'Grand prize food festival experience', 567.25, 500, 20, 'Hard', 'Special', now() + interval '1 day 6 hours'),
('Morning Taco Run', 'Breakfast treats for early birds', 45.50, 50, 3, 'Easy', 'Breakfast', now() + interval '45 minutes');