-- V2: Align users table with auth-service spec and add OAuth2 refresh token fields

-- Fix password column name
ALTER TABLE auth.users RENAME COLUMN password TO password_hash;

-- Add missing user fields
ALTER TABLE auth.users
    ADD COLUMN IF NOT EXISTS last_name   VARCHAR(100)  NOT NULL DEFAULT '',
    ADD COLUMN IF NOT EXISTS role        VARCHAR(20)   NOT NULL DEFAULT 'USER',
    ADD COLUMN IF NOT EXISTS biography   TEXT,
    ADD COLUMN IF NOT EXISTS avatar_url  VARCHAR(500),
    ADD COLUMN IF NOT EXISTS active      BOOLEAN       NOT NULL DEFAULT TRUE;

-- Migrate enabled → active, then drop columns not owned by auth service
UPDATE auth.users SET active = enabled;

ALTER TABLE auth.users
    DROP COLUMN IF EXISTS enabled,
    DROP COLUMN IF EXISTS email_verified,
    DROP COLUMN IF EXISTS provider,
    DROP COLUMN IF EXISTS provider_id,
    DROP COLUMN IF EXISTS universidad,
    DROP COLUMN IF EXISTS carrera,
    DROP COLUMN IF EXISTS semestre;

-- Upgrade refresh_tokens: add hash-based storage and rotation status
ALTER TABLE auth.refresh_tokens
    ADD COLUMN IF NOT EXISTS token_hash  VARCHAR(64)  UNIQUE,
    ADD COLUMN IF NOT EXISTS status      VARCHAR(20)  NOT NULL DEFAULT 'ACTIVE',
    ADD COLUMN IF NOT EXISTS session_id  UUID;

-- Make plain token column optional (legacy, will not be used going forward)
ALTER TABLE auth.refresh_tokens
    ALTER COLUMN token DROP NOT NULL;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_hash      ON auth.refresh_tokens(token_hash);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_session   ON auth.refresh_tokens(session_id);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_expires   ON auth.refresh_tokens(expires_at);
