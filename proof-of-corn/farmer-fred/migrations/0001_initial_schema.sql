-- ============================================
-- Farmer Fred D1 Database - Initial Schema
-- ============================================
-- Migrates ephemeral KV data (log:*, email:*, task:*, etc.)
-- to durable, queryable D1 (SQLite) tables.
--
-- Migration: 0001_initial_schema
-- Date: 2026-02-08
-- ============================================

-- ============================================
-- 1. DECISIONS (was KV log:*)
-- ============================================
-- Every decision, event, or log entry Fred records.
-- Previously stored as KV `log:{timestamp}` with 90-day TTL.

CREATE TABLE IF NOT EXISTS decisions (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  timestamp     TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  category      TEXT    NOT NULL CHECK (category IN (
                  'infrastructure', 'code', 'research', 'planning',
                  'farming', 'outreach', 'agent', 'milestone', 'community'
                )),
  title         TEXT    NOT NULL,
  description   TEXT    NOT NULL DEFAULT '',
  cost          REAL    NOT NULL DEFAULT 0.0,
  ai_decision   INTEGER NOT NULL DEFAULT 1,  -- boolean: 1 = autonomous, 0 = human-directed
  region        TEXT,
  principles    TEXT,                         -- JSON array of principle names
  data_json     TEXT                          -- arbitrary extra data as JSON
);

CREATE INDEX idx_decisions_timestamp  ON decisions (timestamp DESC);
CREATE INDEX idx_decisions_category   ON decisions (category);
CREATE INDEX idx_decisions_region     ON decisions (region);


-- ============================================
-- 2. EMAILS (was KV email:*)
-- ============================================
-- All inbound and outbound email records.
-- Previously stored as KV `email:{id}` with 90-day TTL.

CREATE TABLE IF NOT EXISTS emails (
  id              TEXT    PRIMARY KEY,        -- e.g. "email-1706000000-abc123"
  from_addr       TEXT    NOT NULL,
  to_addr         TEXT    NOT NULL DEFAULT 'fred@proofofcorn.com',
  subject         TEXT    NOT NULL DEFAULT '(no subject)',
  body            TEXT    NOT NULL DEFAULT '',
  received_at     TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  status          TEXT    NOT NULL DEFAULT 'unread' CHECK (status IN (
                    'unread', 'read', 'replied', 'archived'
                  )),
  category        TEXT    CHECK (category IN (
                    'lead', 'partnership', 'question', 'spam', 'other', 'suspicious'
                  )),
  security_score  REAL,                       -- 0.0-1.0 confidence
  security_safe   INTEGER,                    -- boolean
  security_threat TEXT,                       -- threat type if flagged
  thread_id       TEXT,                       -- for grouping email threads
  data_json       TEXT                        -- full security check payload, etc.
);

CREATE INDEX idx_emails_status       ON emails (status);
CREATE INDEX idx_emails_category     ON emails (category);
CREATE INDEX idx_emails_received_at  ON emails (received_at DESC);
CREATE INDEX idx_emails_from_addr    ON emails (from_addr);
CREATE INDEX idx_emails_thread_id    ON emails (thread_id);


-- ============================================
-- 3. TASKS (was KV task:*)
-- ============================================
-- Task queue for Fred's autonomous and human-assigned work.
-- Previously stored as KV `task:{id}` with no explicit TTL
-- (but KV TTL on surrounding data meant tasks were effectively ephemeral).

CREATE TABLE IF NOT EXISTS tasks (
  id                TEXT    PRIMARY KEY,      -- e.g. "1706000000-abc123"
  type              TEXT    NOT NULL CHECK (type IN (
                      'respond_email', 'research', 'outreach', 'decision', 'follow_up'
                    )),
  priority          TEXT    NOT NULL DEFAULT 'medium' CHECK (priority IN (
                      'high', 'medium', 'low'
                    )),
  title             TEXT    NOT NULL,
  description       TEXT    NOT NULL DEFAULT '',
  status            TEXT    NOT NULL DEFAULT 'pending' CHECK (status IN (
                      'pending', 'in_progress', 'completed', 'blocked'
                    )),
  assigned_to       TEXT    NOT NULL DEFAULT 'fred',
  created_at        TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  due_at            TEXT,
  completed_at      TEXT,
  related_email_id  TEXT    REFERENCES emails(id)
);

CREATE INDEX idx_tasks_status       ON tasks (status);
CREATE INDEX idx_tasks_priority     ON tasks (priority);
CREATE INDEX idx_tasks_type         ON tasks (type);
CREATE INDEX idx_tasks_created_at   ON tasks (created_at DESC);
CREATE INDEX idx_tasks_assigned_to  ON tasks (assigned_to);


-- ============================================
-- 4. PARTNERSHIPS (was KV partnerships:latest-evaluation)
-- ============================================
-- Partnership evaluations over time. Previously only the
-- latest evaluation was cached in KV with a 7-day TTL.
-- Now we keep full history for trend analysis.

CREATE TABLE IF NOT EXISTS partnerships (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  partner_name    TEXT    NOT NULL,
  evaluation_date TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  scores_json     TEXT    NOT NULL DEFAULT '{}',  -- {"fiduciary":8,"regenerative":7,...}
  total_score     INTEGER NOT NULL DEFAULT 0,
  recommendation  TEXT    NOT NULL DEFAULT 'consider' CHECK (recommendation IN (
                    'pursue', 'consider', 'decline'
                  )),
  rationale       TEXT    NOT NULL DEFAULT '',
  priority        INTEGER NOT NULL DEFAULT 0,     -- 1 = pursue first, higher = lower priority
  risks           TEXT,                            -- JSON array of risk strings
  opportunities   TEXT,                            -- JSON array of opportunity strings
  data_json       TEXT                             -- full evaluation payload
);

CREATE INDEX idx_partnerships_partner_name    ON partnerships (partner_name);
CREATE INDEX idx_partnerships_evaluation_date ON partnerships (evaluation_date DESC);
CREATE INDEX idx_partnerships_recommendation  ON partnerships (recommendation);
CREATE INDEX idx_partnerships_priority        ON partnerships (priority);


-- ============================================
-- 5. WEATHER HISTORY (was KV weather cache, overwritten)
-- ============================================
-- Weather readings over time. Previously only the latest
-- reading was cached with a short TTL. Now we keep a
-- full time-series for seasonal analysis and planting decisions.

CREATE TABLE IF NOT EXISTS weather_history (
  id                  INTEGER PRIMARY KEY AUTOINCREMENT,
  region              TEXT    NOT NULL,
  timestamp           TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  temperature         REAL    NOT NULL,          -- Fahrenheit
  humidity            REAL,                      -- percentage
  conditions          TEXT    NOT NULL DEFAULT '',
  planting_viable     INTEGER NOT NULL DEFAULT 0, -- boolean
  frost_risk          INTEGER NOT NULL DEFAULT 0, -- boolean
  soil_temp_estimate  REAL,                       -- Fahrenheit, estimated
  forecast            TEXT,
  data_json           TEXT                        -- raw API response, extra fields
);

CREATE INDEX idx_weather_region     ON weather_history (region);
CREATE INDEX idx_weather_timestamp  ON weather_history (timestamp DESC);
CREATE INDEX idx_weather_region_ts  ON weather_history (region, timestamp DESC);


-- ============================================
-- 6. BUDGET (new structured table)
-- ============================================
-- Spending and revenue tracking. Previously a single
-- KV key "budget" held {spent, allocated} as a blob.
-- Now each transaction is a row for full audit trail.

CREATE TABLE IF NOT EXISTS budget (
  id        INTEGER PRIMARY KEY AUTOINCREMENT,
  date      TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%d', 'now')),
  item      TEXT    NOT NULL,
  amount    REAL    NOT NULL,                    -- positive value; category determines sign
  category  TEXT    NOT NULL CHECK (category IN ('expense', 'revenue')),
  status    TEXT    NOT NULL DEFAULT 'confirmed' CHECK (status IN (
              'pending', 'confirmed', 'cancelled'
            )),
  notes     TEXT,
  data_json TEXT
);

CREATE INDEX idx_budget_date     ON budget (date DESC);
CREATE INDEX idx_budget_category ON budget (category);
CREATE INDEX idx_budget_status   ON budget (status);


-- ============================================
-- 7. CONTACTS (was KV contact:*)
-- ============================================
-- CRM for all contacts captured via phone calls, emails,
-- and outreach. Previously stored as KV `contact:{id}` with
-- a separate `contacts:index` key and 1-year TTL.

CREATE TABLE IF NOT EXISTS contacts (
  id              TEXT    PRIMARY KEY,            -- e.g. "contact:1706000000-john-doe"
  name            TEXT    NOT NULL,
  email           TEXT,
  phone           TEXT,
  twitter         TEXT,
  organization    TEXT,
  role            TEXT,
  source          TEXT    NOT NULL DEFAULT 'unknown',  -- phone_call, email, outreach, manual
  interest        TEXT    NOT NULL DEFAULT 'general',
  first_contact   TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  last_contact    TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  notes           TEXT,
  data_json       TEXT
);

CREATE INDEX idx_contacts_name    ON contacts (name);
CREATE INDEX idx_contacts_email   ON contacts (email);
CREATE INDEX idx_contacts_source  ON contacts (source);


-- ============================================
-- 8. TWEETS (new table for X integration)
-- ============================================
-- Tweet history for the @farmerfredai account.
-- Tracks content, timing, and engagement metrics.

CREATE TABLE IF NOT EXISTS tweets (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  tweet_id        TEXT    UNIQUE,                -- Twitter/X post ID
  text            TEXT    NOT NULL,
  posted_at       TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  engagement_json TEXT,                          -- {"likes":0,"retweets":0,"replies":0,"impressions":0}
  in_reply_to     TEXT,                          -- tweet_id this is replying to
  data_json       TEXT                           -- media URLs, thread info, etc.
);

CREATE INDEX idx_tweets_posted_at ON tweets (posted_at DESC);
CREATE INDEX idx_tweets_tweet_id  ON tweets (tweet_id);


-- ============================================
-- 9. LEARNINGS (was KV learning:*)
-- ============================================
-- What Fred has learned from interactions.
-- Previously stored as KV `learning:{id}` with 1-year TTL.

CREATE TABLE IF NOT EXISTS learnings (
  id            TEXT    PRIMARY KEY,
  source        TEXT    NOT NULL CHECK (source IN (
                  'email', 'hn', 'feedback', 'decision', 'observation', 'call'
                )),
  source_id     TEXT,                            -- reference to originating record
  insight       TEXT    NOT NULL,
  category      TEXT    NOT NULL DEFAULT 'general' CHECK (category IN (
                  'communication', 'farming', 'partnerships', 'community', 'operations', 'general'
                )),
  confidence    TEXT    NOT NULL DEFAULT 'medium' CHECK (confidence IN (
                  'high', 'medium', 'low'
                )),
  created_at    TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  applied_count INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX idx_learnings_category   ON learnings (category);
CREATE INDEX idx_learnings_source     ON learnings (source);
CREATE INDEX idx_learnings_created_at ON learnings (created_at DESC);


-- ============================================
-- 10. FEEDBACK (was KV feedback:*)
-- ============================================
-- Community feedback submitted via /feedback endpoint.
-- Previously stored as KV `feedback:{id}` with 180-day TTL.

CREATE TABLE IF NOT EXISTS feedback (
  id          TEXT    PRIMARY KEY,
  author      TEXT    NOT NULL DEFAULT 'Anonymous',
  type        TEXT    NOT NULL DEFAULT 'suggestion' CHECK (type IN (
                'suggestion', 'bug', 'improvement', 'question', 'praise'
              )),
  content     TEXT    NOT NULL,
  status      TEXT    NOT NULL DEFAULT 'pending' CHECK (status IN (
                'pending', 'reviewed', 'incorporated', 'declined'
              )),
  created_at  TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  reviewed_at TEXT,
  learning_id TEXT    REFERENCES learnings(id)   -- if this feedback became a learning
);

CREATE INDEX idx_feedback_status     ON feedback (status);
CREATE INDEX idx_feedback_type       ON feedback (type);
CREATE INDEX idx_feedback_created_at ON feedback (created_at DESC);
