-- SurakshitPath PostgreSQL schema.
-- Safe to run more than once. The server also runs this file automatically on start,
-- or you can run it by hand: paste it in Neon's SQL Editor, or `npm run db:init --prefix server`.

CREATE TABLE IF NOT EXISTS users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT NOT NULL,
  email         TEXT NOT NULL,
  password_hash TEXT NOT NULL,            -- scrypt hash ("salt:hash"), never the plain password
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS users_email_unique ON users (lower(email));

CREATE TABLE IF NOT EXISTS journeys (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_place  TEXT,
  to_place    TEXT,
  date        TEXT,
  time        TEXT,
  duration    DOUBLE PRECISION,
  score       DOUBLE PRECISION,
  status      TEXT NOT NULL DEFAULT 'Completed' CHECK (status IN ('Completed', 'Cancelled')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS reports (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type        TEXT NOT NULL,
  location    TEXT NOT NULL,
  description TEXT NOT NULL,
  image       TEXT,
  date        TEXT,
  status      TEXT NOT NULL DEFAULT 'Pending Verification',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS contacts (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  relation    TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
