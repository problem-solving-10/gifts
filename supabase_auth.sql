-- ============================================================
-- Login credentials table
-- Run this in Supabase SQL Editor
-- ============================================================

CREATE TABLE IF NOT EXISTS app_credentials (
  id         INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  username   TEXT NOT NULL UNIQUE,
  password   TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default login: kumar / 1974
-- You can UPDATE this row anytime to change password
INSERT INTO app_credentials (username, password)
VALUES ('kumar', '1974')
ON CONFLICT (username) DO NOTHING;

-- To change password later, run:
-- UPDATE app_credentials SET password = 'newpassword' WHERE username = 'kumar';

-- To change username, run:
-- UPDATE app_credentials SET username = 'newusername' WHERE username = 'kumar';
