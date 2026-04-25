-- Pulse — Supabase Database Schema
-- Run this in your Supabase SQL Editor (Dashboard → SQL Editor → New Query)

-- ============================================================
-- USERS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  wallet_address TEXT UNIQUE NOT NULL,
  username TEXT,
  x_handle TEXT,
  curator_score NUMERIC DEFAULT 0,
  fee_share_earned NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_users_wallet ON users(wallet_address);
CREATE INDEX idx_users_curator_score ON users(curator_score DESC);

-- ============================================================
-- SQUADS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS squads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT DEFAULT '',
  created_by TEXT NOT NULL REFERENCES users(wallet_address),
  max_members INTEGER DEFAULT 10,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_squads_slug ON squads(slug);
CREATE INDEX idx_squads_created_by ON squads(created_by);

-- ============================================================
-- SQUAD MEMBERS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS squad_members (
  squad_id UUID REFERENCES squads(id) ON DELETE CASCADE,
  wallet_address TEXT REFERENCES users(wallet_address) ON DELETE CASCADE,
  role TEXT DEFAULT 'member' CHECK (role IN ('owner', 'member')),
  joined_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (squad_id, wallet_address)
);

-- ============================================================
-- AI BRIEFING CACHE
-- ============================================================
CREATE TABLE IF NOT EXISTS ai_briefs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  token_address TEXT NOT NULL,
  brief_text TEXT NOT NULL,
  model TEXT DEFAULT 'gemini-2.0-flash',
  generated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_ai_briefs_token ON ai_briefs(token_address);
CREATE INDEX idx_ai_briefs_generated ON ai_briefs(generated_at DESC);

-- Keep only latest brief per token (cleanup old ones)
CREATE UNIQUE INDEX idx_ai_briefs_latest ON ai_briefs(token_address, generated_at DESC);

-- ============================================================
-- LEADERBOARD SNAPSHOTS
-- ============================================================
CREATE TABLE IF NOT EXISTS leaderboard_snapshots (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  wallet_address TEXT NOT NULL REFERENCES users(wallet_address),
  rank INTEGER NOT NULL,
  curator_score NUMERIC NOT NULL,
  top_pick TEXT,
  week_performance NUMERIC DEFAULT 0,
  snapshot_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_leaderboard_snapshot ON leaderboard_snapshots(snapshot_at DESC);
CREATE INDEX idx_leaderboard_wallet ON leaderboard_snapshots(wallet_address);

-- ============================================================
-- TOKEN WATCHLIST (user favorites)
-- ============================================================
CREATE TABLE IF NOT EXISTS watchlist (
  wallet_address TEXT REFERENCES users(wallet_address) ON DELETE CASCADE,
  token_address TEXT NOT NULL,
  added_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (wallet_address, token_address)
);

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE squads ENABLE ROW LEVEL SECURITY;
ALTER TABLE squad_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_briefs ENABLE ROW LEVEL SECURITY;
ALTER TABLE leaderboard_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE watchlist ENABLE ROW LEVEL SECURITY;

-- Public read access for all tables (this is a social app)
CREATE POLICY "Public read access" ON users FOR SELECT USING (true);
CREATE POLICY "Public read access" ON squads FOR SELECT USING (true);
CREATE POLICY "Public read access" ON squad_members FOR SELECT USING (true);
CREATE POLICY "Public read access" ON ai_briefs FOR SELECT USING (true);
CREATE POLICY "Public read access" ON leaderboard_snapshots FOR SELECT USING (true);
CREATE POLICY "Public read access" ON watchlist FOR SELECT USING (true);

-- Service role can do everything (for API routes)
CREATE POLICY "Service role full access" ON users FOR ALL USING (true);
CREATE POLICY "Service role full access" ON squads FOR ALL USING (true);
CREATE POLICY "Service role full access" ON squad_members FOR ALL USING (true);
CREATE POLICY "Service role full access" ON ai_briefs FOR ALL USING (true);
CREATE POLICY "Service role full access" ON leaderboard_snapshots FOR ALL USING (true);
CREATE POLICY "Service role full access" ON watchlist FOR ALL USING (true);

-- ============================================================
-- HELPER FUNCTION: Auto-update updated_at
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER squads_updated_at
  BEFORE UPDATE ON squads
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
