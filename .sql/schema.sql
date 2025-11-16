-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('Admin', 'Kernlid', 'Vrijwilliger')) DEFAULT 'Vrijwilliger',
  team_id UUID REFERENCES teams(id) ON DELETE SET NULL,
  name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

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

-- Events table
CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  date TIMESTAMP WITH TIME ZONE NOT NULL,
  location TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Shifts table
CREATE TABLE IF NOT EXISTS shifts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  max_slots INTEGER NOT NULL CHECK (max_slots > 0) DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Signups table (junction table)
CREATE TABLE IF NOT EXISTS signups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  shift_id UUID NOT NULL REFERENCES shifts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(shift_id, user_id)
);

-- News table
CREATE TABLE IF NOT EXISTS news (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  image_url TEXT,
  author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- News comments table
CREATE TABLE IF NOT EXISTS news_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  news_id UUID NOT NULL REFERENCES news(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Sponsors table
CREATE TABLE IF NOT EXISTS sponsors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  logo_url TEXT,
  website_url TEXT,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Pages table (for static pages)
CREATE TABLE IF NOT EXISTS pages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Password vault table (visible to Admin and Kernleden)
CREATE TABLE IF NOT EXISTS password_vault (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  platform TEXT NOT NULL,
  username TEXT,
  password TEXT NOT NULL,
  url TEXT,
  notes TEXT,
  visibility_admin BOOLEAN NOT NULL DEFAULT true,
  visibility_kernlid BOOLEAN NOT NULL DEFAULT false,
  visibility_custom BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Junction table for custom visibility (specific users per entry)
CREATE TABLE IF NOT EXISTS password_vault_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  password_vault_id UUID NOT NULL REFERENCES password_vault(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(password_vault_id, user_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_shifts_event_id ON shifts(event_id);
CREATE INDEX IF NOT EXISTS idx_signups_shift_id ON signups(shift_id);
CREATE INDEX IF NOT EXISTS idx_signups_user_id ON signups(user_id);
CREATE INDEX IF NOT EXISTS idx_news_author_id ON news(author_id);
CREATE INDEX IF NOT EXISTS idx_news_comments_news_id ON news_comments(news_id);
CREATE INDEX IF NOT EXISTS idx_news_comments_user_id ON news_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_pages_slug ON pages(slug);
CREATE INDEX IF NOT EXISTS idx_users_team_id ON users(team_id);
CREATE INDEX IF NOT EXISTS idx_user_werkgroepen_user_id ON user_werkgroepen(user_id);
CREATE INDEX IF NOT EXISTS idx_user_werkgroepen_werkgroep_id ON user_werkgroepen(werkgroep_id);
CREATE INDEX IF NOT EXISTS idx_password_vault_platform ON password_vault(platform);
CREATE INDEX IF NOT EXISTS idx_password_vault_users_vault_id ON password_vault_users(password_vault_id);
CREATE INDEX IF NOT EXISTS idx_password_vault_users_user_id ON password_vault_users(user_id);

-- Row Level Security (RLS) Policies

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE shifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE signups ENABLE ROW LEVEL SECURITY;
ALTER TABLE news ENABLE ROW LEVEL SECURITY;
ALTER TABLE sponsors ENABLE ROW LEVEL SECURITY;
ALTER TABLE pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE password_vault ENABLE ROW LEVEL SECURITY;
ALTER TABLE password_vault_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE news_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE werkgroepen ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_werkgroepen ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to allow re-running the script)
DROP POLICY IF EXISTS "Users are viewable by everyone" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Users can insert own profile" ON users;

DROP POLICY IF EXISTS "Events are viewable by everyone" ON events;
DROP POLICY IF EXISTS "Admin/Kernlid can manage events" ON events;

DROP POLICY IF EXISTS "Shifts are viewable by everyone" ON shifts;
DROP POLICY IF EXISTS "Admin/Kernlid can manage shifts" ON shifts;

DROP POLICY IF EXISTS "Signups are viewable by everyone" ON signups;
DROP POLICY IF EXISTS "Users can manage own signups" ON signups;

DROP POLICY IF EXISTS "News is viewable by everyone" ON news;
DROP POLICY IF EXISTS "Admin/Kernlid can manage news" ON news;

DROP POLICY IF EXISTS "Sponsors are viewable by everyone" ON sponsors;
DROP POLICY IF EXISTS "Admin can manage sponsors" ON sponsors;

DROP POLICY IF EXISTS "Pages are viewable by everyone" ON pages;
DROP POLICY IF EXISTS "Admin can manage pages" ON pages;

DROP POLICY IF EXISTS "Admin can view password vault" ON password_vault;
DROP POLICY IF EXISTS "Admin and Kernleden can view password vault" ON password_vault;
DROP POLICY IF EXISTS "Admin can manage password vault" ON password_vault;
DROP POLICY IF EXISTS "Admin can manage password vault users" ON password_vault_users;
DROP POLICY IF EXISTS "Users can view own password vault entries" ON password_vault_users;

DROP POLICY IF EXISTS "News comments are viewable by everyone" ON news_comments;
DROP POLICY IF EXISTS "Authenticated users can create comments" ON news_comments;
DROP POLICY IF EXISTS "Users can manage own comments" ON news_comments;

DROP POLICY IF EXISTS "Teams are viewable by everyone" ON teams;
DROP POLICY IF EXISTS "Admin can manage teams" ON teams;
DROP POLICY IF EXISTS "Werkgroepen are viewable by everyone" ON werkgroepen;
DROP POLICY IF EXISTS "Admin/Kernlid can manage werkgroepen" ON werkgroepen;
DROP POLICY IF EXISTS "User werkgroepen are viewable by everyone" ON user_werkgroepen;
DROP POLICY IF EXISTS "Admin/Kernlid can manage user werkgroepen" ON user_werkgroepen;

-- Users: Everyone can read, users can update their own profile
CREATE POLICY "Users are viewable by everyone" ON users
  FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Events: Everyone can read, Admin/Kernlid can modify
CREATE POLICY "Events are viewable by everyone" ON events
  FOR SELECT USING (true);

CREATE POLICY "Admin/Kernlid can manage events" ON events
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('Admin', 'Kernlid')
    )
  );

-- Shifts: Everyone can read, Admin/Kernlid can modify
CREATE POLICY "Shifts are viewable by everyone" ON shifts
  FOR SELECT USING (true);

CREATE POLICY "Admin/Kernlid can manage shifts" ON shifts
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('Admin', 'Kernlid')
    )
  );

-- Signups: Everyone can read, authenticated users can manage their own
CREATE POLICY "Signups are viewable by everyone" ON signups
  FOR SELECT USING (true);

CREATE POLICY "Users can manage own signups" ON signups
  FOR ALL USING (auth.uid() = user_id);

-- News: Everyone can read, Admin/Kernlid can modify
CREATE POLICY "News is viewable by everyone" ON news
  FOR SELECT USING (true);

CREATE POLICY "Admin/Kernlid can manage news" ON news
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('Admin', 'Kernlid')
    )
  );

-- Sponsors: Everyone can read, Admin can modify
CREATE POLICY "Sponsors are viewable by everyone" ON sponsors
  FOR SELECT USING (true);

CREATE POLICY "Admin can manage sponsors" ON sponsors
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'Admin'
    )
  );

-- Pages: Everyone can read, Admin can modify
CREATE POLICY "Pages are viewable by everyone" ON pages
  FOR SELECT USING (true);

CREATE POLICY "Admin can manage pages" ON pages
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'Admin'
    )
  );

-- Password vault: Admin and Kernleden can view based on visibility settings
CREATE POLICY "Admin and Kernleden can view password vault" ON password_vault
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('Admin', 'Kernlid')
      AND (
        -- Admin can see all
        users.role = 'Admin'
        OR
        -- Kernlid can see if visibility_kernlid is true
        (users.role = 'Kernlid' AND password_vault.visibility_kernlid = true)
        OR
        -- Users can see if they are in the custom visibility list
        (
          password_vault.visibility_custom = true
          AND EXISTS (
            SELECT 1 FROM password_vault_users
            WHERE password_vault_users.password_vault_id = password_vault.id
            AND password_vault_users.user_id = auth.uid()
          )
        )
      )
    )
  );

-- Only Admin can manage password vault
CREATE POLICY "Admin can manage password vault" ON password_vault
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'Admin'
    )
  );

-- Password vault users: Only Admin can manage, users can see their own entries
CREATE POLICY "Admin can manage password vault users" ON password_vault_users
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'Admin'
    )
  );

CREATE POLICY "Users can view own password vault entries" ON password_vault_users
  FOR SELECT USING (auth.uid() = user_id);

-- News comments: Everyone can read, authenticated users can create, users can manage their own
CREATE POLICY "News comments are viewable by everyone" ON news_comments
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create comments" ON news_comments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage own comments" ON news_comments
  FOR ALL USING (auth.uid() = user_id);

-- Teams: Everyone can read, Admin can modify
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

-- Werkgroepen: Everyone can read, Admin/Kernlid can modify
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

-- User werkgroepen: Everyone can read, Admin/Kernlid can modify
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

-- Functions and Triggers

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Drop existing triggers if they exist (to allow re-running the script)
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
DROP TRIGGER IF EXISTS update_events_updated_at ON events;
DROP TRIGGER IF EXISTS update_shifts_updated_at ON shifts;
DROP TRIGGER IF EXISTS update_news_updated_at ON news;
DROP TRIGGER IF EXISTS update_sponsors_updated_at ON sponsors;
DROP TRIGGER IF EXISTS update_pages_updated_at ON pages;
DROP TRIGGER IF EXISTS update_password_vault_updated_at ON password_vault;

-- Triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON events
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_shifts_updated_at BEFORE UPDATE ON shifts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_news_updated_at BEFORE UPDATE ON news
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sponsors_updated_at BEFORE UPDATE ON sponsors
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pages_updated_at BEFORE UPDATE ON pages
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_password_vault_updated_at BEFORE UPDATE ON password_vault
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_news_comments_updated_at BEFORE UPDATE ON news_comments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_teams_updated_at BEFORE UPDATE ON teams
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_werkgroepen_updated_at BEFORE UPDATE ON werkgroepen
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to auto-create user profile on auth.users insert
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, role)
  VALUES (NEW.id, NEW.email, 'Vrijwilliger');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if it exists (to allow re-running the script)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Trigger to create user profile
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

