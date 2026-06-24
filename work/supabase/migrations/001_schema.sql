-- JobMarket Supabase schema
-- Run in Supabase SQL Editor or via supabase db push

-- ---------------------------------------------------------------------------
-- Categories
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  icon TEXT NOT NULL DEFAULT 'Briefcase',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------------------------
-- Profiles (extends auth.users when using Supabase Auth)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS profiles (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  phone TEXT,
  title TEXT,
  avatar_url TEXT,
  role TEXT NOT NULL DEFAULT 'seeker' CHECK (role IN ('seeker', 'poster', 'admin')),
  profile_role TEXT NOT NULL DEFAULT 'seeker' CHECK (profile_role IN ('seeker', 'poster', 'both')),
  language TEXT NOT NULL DEFAULT 'en' CHECK (language IN ('en', 'uz', 'ru')),
  notifications JSONB NOT NULL DEFAULT '{"emailAlerts":true,"pushAlerts":true,"jobMatches":true,"chatMessages":true,"marketing":false}'::jsonb,
  badge TEXT,
  company_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------------------------
-- Jobs
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS jobs (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  company_id TEXT NOT NULL,
  company_name TEXT NOT NULL,
  company_logo TEXT,
  category_id TEXT NOT NULL REFERENCES categories(id),
  poster_id TEXT NOT NULL REFERENCES profiles(id),
  description TEXT NOT NULL,
  requirements JSONB NOT NULL DEFAULT '[]'::jsonb,
  responsibilities JSONB DEFAULT '[]'::jsonb,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('draft', 'pending', 'active', 'closed')),
  work_type TEXT NOT NULL CHECK (work_type IN ('remote', 'onsite', 'hybrid')),
  schedule_type TEXT NOT NULL CHECK (schedule_type IN ('full-time', 'part-time', 'freelance', 'contract')),
  schedule_pattern TEXT NOT NULL DEFAULT 'standard',
  location JSONB NOT NULL,
  salary_min NUMERIC NOT NULL DEFAULT 0,
  salary_max NUMERIC NOT NULL DEFAULT 0,
  salary_currency TEXT NOT NULL DEFAULT 'USD',
  skills JSONB NOT NULL DEFAULT '[]'::jsonb,
  is_featured BOOLEAN NOT NULL DEFAULT FALSE,
  contact_phone TEXT,
  address TEXT,
  district TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);
CREATE INDEX IF NOT EXISTS idx_jobs_category ON jobs(category_id);
CREATE INDEX IF NOT EXISTS idx_jobs_poster ON jobs(poster_id);
CREATE INDEX IF NOT EXISTS idx_jobs_created ON jobs(created_at DESC);

-- ---------------------------------------------------------------------------
-- Favorites
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS favorites (
  user_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  job_id TEXT NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, job_id)
);

-- ---------------------------------------------------------------------------
-- Chats & messages
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS chats (
  id TEXT PRIMARY KEY,
  job_id TEXT REFERENCES jobs(id) ON DELETE SET NULL,
  last_message_id TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS chat_participants (
  chat_id TEXT NOT NULL REFERENCES chats(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  PRIMARY KEY (chat_id, user_id)
);

CREATE TABLE IF NOT EXISTS messages (
  id TEXT PRIMARY KEY,
  chat_id TEXT NOT NULL REFERENCES chats(id) ON DELETE CASCADE,
  sender_id TEXT NOT NULL REFERENCES profiles(id),
  body TEXT NOT NULL,
  read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_messages_chat ON messages(chat_id, created_at);

-- ---------------------------------------------------------------------------
-- Reports / moderation
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS reports (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  reporter_id TEXT NOT NULL REFERENCES profiles(id),
  target_type TEXT NOT NULL CHECK (target_type IN ('job', 'user', 'message')),
  target_id TEXT NOT NULL,
  reason TEXT NOT NULL,
  details TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved', 'dismissed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_reports_status ON reports(status);

-- ---------------------------------------------------------------------------
-- updated_at trigger
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS profiles_updated_at ON profiles;
CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS jobs_updated_at ON jobs;
CREATE TRIGGER jobs_updated_at BEFORE UPDATE ON jobs
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

-- Profiles: public read, users update own row
CREATE POLICY "profiles_select_all" ON profiles FOR SELECT USING (true);
CREATE POLICY "profiles_insert_own" ON profiles FOR INSERT WITH CHECK (auth.uid()::text = id);
CREATE POLICY "profiles_update_own" ON profiles FOR UPDATE USING (auth.uid()::text = id);

-- Categories: public read
CREATE POLICY "categories_select_all" ON categories FOR SELECT USING (true);

-- Jobs: public read active; poster manages own
CREATE POLICY "jobs_select_active" ON jobs FOR SELECT USING (
  status = 'active' OR poster_id = auth.uid()::text
);
CREATE POLICY "jobs_insert_own" ON jobs FOR INSERT WITH CHECK (poster_id = auth.uid()::text);
CREATE POLICY "jobs_update_own" ON jobs FOR UPDATE USING (poster_id = auth.uid()::text);

-- Favorites: own rows only
CREATE POLICY "favorites_select_own" ON favorites FOR SELECT USING (user_id = auth.uid()::text);
CREATE POLICY "favorites_insert_own" ON favorites FOR INSERT WITH CHECK (user_id = auth.uid()::text);
CREATE POLICY "favorites_delete_own" ON favorites FOR DELETE USING (user_id = auth.uid()::text);

-- Chats: participants only
CREATE POLICY "chats_select_participant" ON chats FOR SELECT USING (
  EXISTS (SELECT 1 FROM chat_participants cp WHERE cp.chat_id = id AND cp.user_id = auth.uid()::text)
);
CREATE POLICY "chats_insert_authenticated" ON chats FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "chat_participants_select" ON chat_participants FOR SELECT USING (
  user_id = auth.uid()::text OR EXISTS (
    SELECT 1 FROM chat_participants cp WHERE cp.chat_id = chat_participants.chat_id AND cp.user_id = auth.uid()::text
  )
);
CREATE POLICY "chat_participants_insert" ON chat_participants FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Messages: chat participants
CREATE POLICY "messages_select_participant" ON messages FOR SELECT USING (
  EXISTS (SELECT 1 FROM chat_participants cp WHERE cp.chat_id = messages.chat_id AND cp.user_id = auth.uid()::text)
);
CREATE POLICY "messages_insert_participant" ON messages FOR INSERT WITH CHECK (
  sender_id = auth.uid()::text AND
  EXISTS (SELECT 1 FROM chat_participants cp WHERE cp.chat_id = messages.chat_id AND cp.user_id = auth.uid()::text)
);
CREATE POLICY "messages_update_read" ON messages FOR UPDATE USING (
  EXISTS (SELECT 1 FROM chat_participants cp WHERE cp.chat_id = messages.chat_id AND cp.user_id = auth.uid()::text)
);

-- Reports: insert own, read own
CREATE POLICY "reports_insert_own" ON reports FOR INSERT WITH CHECK (reporter_id = auth.uid()::text);
CREATE POLICY "reports_select_own" ON reports FOR SELECT USING (reporter_id = auth.uid()::text);

-- ---------------------------------------------------------------------------
-- Realtime (enable in Supabase dashboard: Database > Replication for messages)
-- ALTER PUBLICATION supabase_realtime ADD TABLE messages;
