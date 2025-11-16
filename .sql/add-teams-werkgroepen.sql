-- Add teams, werkgroepen and user_werkgroepen tables
-- Run this in Supabase SQL Editor

-- Teams table (optioneel, voor organisatie structuur)
CREATE TABLE IF NOT EXISTS teams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Werkgroepen table
CREATE TABLE IF NOT EXISTS werkgroepen (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Junction table voor users en werkgroepen
CREATE TABLE IF NOT EXISTS user_werkgroepen (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  werkgroep_id UUID NOT NULL REFERENCES werkgroepen(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, werkgroep_id)
);

-- Update users table to use team_id instead of team text
-- First, check if team_id column exists
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'team_id'
  ) THEN
    -- Add team_id column
    ALTER TABLE users ADD COLUMN team_id UUID REFERENCES teams(id) ON DELETE SET NULL;
    
    -- Migrate existing team data (if any)
    -- This assumes you want to create teams from existing team text values
    -- You may need to adjust this based on your data
  END IF;
END $$;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_users_team_id ON users(team_id);
CREATE INDEX IF NOT EXISTS idx_user_werkgroepen_user_id ON user_werkgroepen(user_id);
CREATE INDEX IF NOT EXISTS idx_user_werkgroepen_werkgroep_id ON user_werkgroepen(werkgroep_id);

-- Enable RLS
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE werkgroepen ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_werkgroepen ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Teams are viewable by everyone" ON teams;
DROP POLICY IF EXISTS "Admin can manage teams" ON teams;
DROP POLICY IF EXISTS "Werkgroepen are viewable by everyone" ON werkgroepen;
DROP POLICY IF EXISTS "Admin/Kernlid can manage werkgroepen" ON werkgroepen;
DROP POLICY IF EXISTS "User werkgroepen are viewable by everyone" ON user_werkgroepen;
DROP POLICY IF EXISTS "Admin/Kernlid can manage user werkgroepen" ON user_werkgroepen;

-- RLS Policies
CREATE POLICY "Teams are viewable by everyone" ON teams
  FOR SELECT USING (true);

CREATE POLICY "Admin can manage teams" ON teams
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'Admin'
    )
  );

CREATE POLICY "Werkgroepen are viewable by everyone" ON werkgroepen
  FOR SELECT USING (true);

CREATE POLICY "Admin/Kernlid can manage werkgroepen" ON werkgroepen
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('Admin', 'Kernlid')
    )
  );

CREATE POLICY "User werkgroepen are viewable by everyone" ON user_werkgroepen
  FOR SELECT USING (true);

CREATE POLICY "Admin/Kernlid can manage user werkgroepen" ON user_werkgroepen
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('Admin', 'Kernlid')
    )
  );

-- Triggers (drop first if they exist)
DROP TRIGGER IF EXISTS update_teams_updated_at ON teams;
CREATE TRIGGER update_teams_updated_at BEFORE UPDATE ON teams
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_werkgroepen_updated_at ON werkgroepen;
CREATE TRIGGER update_werkgroepen_updated_at BEFORE UPDATE ON werkgroepen
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

