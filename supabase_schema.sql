-- ============================================================
-- Personal Gift Management System – Supabase Schema
-- Run this in your Supabase SQL Editor
-- ============================================================

-- EVENTS table
CREATE TABLE IF NOT EXISTS events (
  id            BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name          TEXT NOT NULL,
  event_type    TEXT,
  event_date    DATE,
  location      TEXT,
  address       TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- GIFTS_RECEIVED table
CREATE TABLE IF NOT EXISTS gifts_received (
  id            BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  event_id      BIGINT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  person_name   TEXT NOT NULL,
  phone         TEXT,
  address       TEXT,
  amount        NUMERIC(12,2) NOT NULL DEFAULT 0,
  gift_type     TEXT NOT NULL DEFAULT 'Cash',
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for fast search
CREATE INDEX IF NOT EXISTS idx_gifts_event_id       ON gifts_received(event_id);
CREATE INDEX IF NOT EXISTS idx_gifts_person_name    ON gifts_received USING GIN (to_tsvector('simple', person_name));
CREATE INDEX IF NOT EXISTS idx_gifts_phone          ON gifts_received(phone);
CREATE INDEX IF NOT EXISTS idx_gifts_address        ON gifts_received USING GIN (to_tsvector('simple', coalesce(address, '')));
CREATE INDEX IF NOT EXISTS idx_gifts_gift_type      ON gifts_received(gift_type);
CREATE INDEX IF NOT EXISTS idx_gifts_amount         ON gifts_received(amount);
CREATE INDEX IF NOT EXISTS idx_events_name          ON events USING GIN (to_tsvector('simple', name));

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_events_updated_at
  BEFORE UPDATE ON events
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_gifts_updated_at
  BEFORE UPDATE ON gifts_received
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- GLOBAL SEARCH VIEW (gifts + event info joined)
-- ============================================================
CREATE OR REPLACE VIEW gifts_search_view AS
SELECT
  g.id,
  g.event_id,
  g.person_name,
  g.phone,
  g.address,
  g.amount,
  g.gift_type,
  g.created_at,
  e.name        AS event_name,
  e.event_type,
  e.event_date,
  e.location    AS event_location,
  e.address     AS event_address
FROM gifts_received g
JOIN events e ON e.id = g.event_id;

-- ============================================================
-- Row Level Security (enable if using Supabase Auth)
-- Uncomment these lines if you add authentication:
-- ============================================================
-- ALTER TABLE events         ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE gifts_received ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "allow_all" ON events         FOR ALL USING (true);
-- CREATE POLICY "allow_all" ON gifts_received FOR ALL USING (true);
