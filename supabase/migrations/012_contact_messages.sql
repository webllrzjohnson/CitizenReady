CREATE TABLE contact_messages (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name       TEXT NOT NULL,
  email      TEXT NOT NULL,
  subject    TEXT NOT NULL,
  message    TEXT NOT NULL,
  is_read    BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert contact messages"
  ON contact_messages FOR INSERT WITH CHECK (TRUE);

CREATE POLICY "Admins can read contact messages"
  ON contact_messages FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can update contact messages"
  ON contact_messages FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
