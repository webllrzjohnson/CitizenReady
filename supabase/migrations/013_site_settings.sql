CREATE TABLE site_settings (
  key    TEXT PRIMARY KEY,
  value  TEXT NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read settings"
  ON site_settings FOR SELECT USING (TRUE);

CREATE POLICY "Admins can update settings"
  ON site_settings FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can insert settings"
  ON site_settings FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Default settings
INSERT INTO site_settings (key, value) VALUES
  ('ads_enabled', 'false'),
  ('adsense_client_id', ''),
  ('ads_show_to_guests_only', 'true');
