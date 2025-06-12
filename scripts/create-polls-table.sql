-- Create polls table
CREATE TABLE IF NOT EXISTS polls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question TEXT NOT NULL,
  options JSONB NOT NULL,
  votes JSONB NOT NULL DEFAULT '[]',
  voters JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expiry_date TIMESTAMP WITH TIME ZONE,
  privacy TEXT NOT NULL CHECK (privacy IN ('public', 'private')),
  creator_id TEXT NOT NULL,
  access_code TEXT
);

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_polls_privacy ON polls(privacy);
CREATE INDEX IF NOT EXISTS idx_polls_creator_id ON polls(creator_id);
CREATE INDEX IF NOT EXISTS idx_polls_created_at ON polls(created_at);
