-- Production security hardening

-- Prevent blocked users from creating content
CREATE OR REPLACE FUNCTION is_not_blocked()
RETURNS BOOLEAN AS $$
  SELECT NOT COALESCE(
    (SELECT blocked FROM profiles WHERE id = auth.uid()::text),
    false
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER;

DROP POLICY IF EXISTS jobs_insert_own ON jobs;
CREATE POLICY jobs_insert_own ON jobs FOR INSERT
  WITH CHECK (poster_id = auth.uid()::text AND is_not_blocked());

DROP POLICY IF EXISTS messages_insert_participant ON messages;
CREATE POLICY messages_insert_participant ON messages FOR INSERT
  WITH CHECK (
    sender_id = auth.uid()::text
    AND is_not_blocked()
    AND EXISTS (
      SELECT 1 FROM chat_participants cp
      WHERE cp.chat_id = messages.chat_id AND cp.user_id = auth.uid()::text
    )
  );

DROP POLICY IF EXISTS favorites_insert_own ON favorites;
CREATE POLICY favorites_insert_own ON favorites FOR INSERT
  WITH CHECK (user_id = auth.uid()::text AND is_not_blocked());

DROP POLICY IF EXISTS reports_insert_own ON reports;
CREATE POLICY reports_insert_own ON reports FOR INSERT
  WITH CHECK (reporter_id = auth.uid()::text AND is_not_blocked());

-- Only active jobs visible to public (non-admin, non-poster)
DROP POLICY IF EXISTS jobs_select_active ON jobs;
CREATE POLICY jobs_select_active ON jobs FOR SELECT USING (
  status = 'active'
  OR poster_id = auth.uid()::text
  OR is_admin()
);
