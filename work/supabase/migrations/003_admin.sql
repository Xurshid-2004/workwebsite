-- Admin & moderation extensions

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS blocked BOOLEAN NOT NULL DEFAULT FALSE;

-- Searchable location presets for filters
CREATE TABLE IF NOT EXISTS locations (
  id TEXT PRIMARY KEY,
  label TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO locations (id, label, slug, is_active) VALUES
  ('loc-remote', 'Remote', 'remote', true),
  ('loc-sf', 'San Francisco, CA', 'san-francisco', true),
  ('loc-ny', 'New York, NY', 'new-york', true),
  ('loc-london', 'London, UK', 'london', true),
  ('loc-berlin', 'Berlin, Germany', 'berlin', true)
ON CONFLICT (id) DO NOTHING;

-- Admin profile seed
INSERT INTO profiles (id, email, name, title, avatar_url, role, profile_role, language, badge, blocked)
VALUES (
  'user-admin',
  'admin@jobmarket.app',
  'Admin User',
  'Platform Administrator',
  'https://i.pravatar.cc/150?u=admin',
  'admin',
  'both',
  'en',
  'Admin',
  false
)
ON CONFLICT (id) DO UPDATE SET role = 'admin', badge = 'Admin';

ALTER TABLE locations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "locations_select_all" ON locations FOR SELECT USING (true);

-- Admin helper: check profiles.role = 'admin' for auth.uid()
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()::text AND role = 'admin'
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Admin policies
CREATE POLICY "profiles_admin_all" ON profiles FOR ALL USING (is_admin());
CREATE POLICY "jobs_admin_all" ON jobs FOR ALL USING (is_admin());
CREATE POLICY "reports_admin_select" ON reports FOR SELECT USING (is_admin() OR reporter_id = auth.uid()::text);
CREATE POLICY "reports_admin_update" ON reports FOR UPDATE USING (is_admin());
CREATE POLICY "categories_admin_all" ON categories FOR ALL USING (is_admin());
CREATE POLICY "locations_admin_all" ON locations FOR ALL USING (is_admin());
CREATE POLICY "chats_admin_select" ON chats FOR SELECT USING (is_admin());
CREATE POLICY "chat_participants_admin_select" ON chat_participants FOR SELECT USING (is_admin());
