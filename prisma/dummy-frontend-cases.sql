-- =============================================================================
-- Case-SELECT — frontend development data
-- =============================================================================
--
-- PURPOSE
--   Gives the dashboard enough content to develop and review every case state:
--   completed, in progress, not started and locked.
--
-- THIS IS TEST DATA ONLY.
--   It contains no investigation content: no suspects, victims, evidence,
--   locations or clues. Case C001 and its full investigation dataset belong to
--   prisma/seed.js (content team) and are NOT touched here.
--   The frontend never treats these rows as game logic — see SUGGESTED_IMPROVEMENTS.md.
--
-- USAGE
--   psql "$DATABASE_URL" -f prisma/dummy-frontend-cases.sql
--
--   Run prisma/seed.js FIRST if you want C001's investigation steps present.
--   This script is idempotent: re-running it will not duplicate rows.
--
-- TEARDOWN
--   psql "$DATABASE_URL" -f prisma/dummy-frontend-cases.sql --set=teardown=1
-- =============================================================================

\set ON_ERROR_STOP on

-- ─────────────────────────────────────────────────────────────────────────────
-- Remove a previous run of this script (keeps re-runs idempotent).
-- Only touches the demo user and the four placeholder cases below.
-- ─────────────────────────────────────────────────────────────────────────────

DELETE FROM user_progress WHERE "userId" IN (SELECT id FROM users WHERE username = 'detective');
DELETE FROM cases WHERE id IN ('C002', 'C003', 'C004', 'C005');
DELETE FROM users WHERE username = 'detective';

-- ─────────────────────────────────────────────────────────────────────────────
-- Demo player.
--
-- The app has no authentication, so the dashboard reads progress for a fixed
-- user id (frontend VITE_DEMO_USER_ID, default 2). Inserting the user first
-- keeps the generated id deterministic for an empty database.
--
-- `password` is a placeholder: nothing authenticates against it yet.
-- Do NOT copy this pattern into real authentication work.
-- ─────────────────────────────────────────────────────────────────────────────

INSERT INTO users (id, username, email, password)
VALUES (2, 'detective', 'detective@caseselect.local', 'not-a-real-hash');

-- ─────────────────────────────────────────────────────────────────────────────
-- Placeholder cases.
--
-- Only `id` and `caseName` exist on the cases table — the schema has no
-- description, difficulty or locked column. Display copy and difficulty live in
-- frontend/src/data/caseMeta.js and are clearly marked as dummy data there.
-- ─────────────────────────────────────────────────────────────────────────────

INSERT INTO cases (id, "caseName") VALUES
  ('C002', 'The Missing Analyst'),
  ('C003', 'The Downtown Heist'),
  ('C004', 'The Silent Witness'),
  ('C005', 'The Poisoned Deal');

-- ─────────────────────────────────────────────────────────────────────────────
-- Progress, to exercise each dashboard state.
--
-- ProgressStatus only has IN_PROGRESS and COMPLETED, so:
--   C001 -> COMPLETED   (status comes from the database)
--   C002 -> IN_PROGRESS (status comes from the database)
--   C003 -> no row      (frontend derives NOT STARTED)
--   C004 -> no row      (frontend derives NOT STARTED)
--   C005 -> no row      (frontend derives LOCKED, display-only flag)
-- ─────────────────────────────────────────────────────────────────────────────

INSERT INTO user_progress ("userId", "caseId", status)
VALUES
  (2, 'C001', 'COMPLETED'),
  (2, 'C002', 'IN_PROGRESS');

-- =============================================================================
-- Verify
-- =============================================================================

SELECT 'cases' AS table_name, count(*) AS rows FROM cases
UNION ALL SELECT 'users', count(*) FROM users
UNION ALL SELECT 'user_progress', count(*) FROM user_progress
ORDER BY table_name;
