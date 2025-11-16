-- Add news_comments table
-- Run this in Supabase SQL Editor

-- News comments table
CREATE TABLE IF NOT EXISTS news_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  news_id UUID NOT NULL REFERENCES news(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_news_comments_news_id ON news_comments(news_id);
CREATE INDEX IF NOT EXISTS idx_news_comments_user_id ON news_comments(user_id);

-- Enable RLS
ALTER TABLE news_comments ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "News comments are viewable by everyone" ON news_comments;
DROP POLICY IF EXISTS "Authenticated users can create comments" ON news_comments;
DROP POLICY IF EXISTS "Users can manage own comments" ON news_comments;

-- RLS Policies
CREATE POLICY "News comments are viewable by everyone" ON news_comments
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create comments" ON news_comments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage own comments" ON news_comments
  FOR ALL USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE TRIGGER update_news_comments_updated_at BEFORE UPDATE ON news_comments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

