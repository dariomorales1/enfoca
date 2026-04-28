-- V3: OAuth2/PKCE support — registered clients and authorization sessions

CREATE TABLE IF NOT EXISTS auth.oauth2_clients (
    id               UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id        VARCHAR(255)  NOT NULL UNIQUE,
    client_name      VARCHAR(255)  NOT NULL,
    redirect_uris    TEXT          NOT NULL,
    allowed_scopes   VARCHAR(500)  NOT NULL DEFAULT 'openid profile email',
    active           BOOLEAN       NOT NULL DEFAULT TRUE,
    created_at       TIMESTAMP     NOT NULL DEFAULT NOW()
);

-- Tracks a full PKCE authorization session from initiation through token exchange.
-- Status progression: PENDING → CODE_ISSUED → COMPLETED
CREATE TABLE IF NOT EXISTS auth.authorization_sessions (
    id                      UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id               VARCHAR(255)  NOT NULL,
    redirect_uri            VARCHAR(500)  NOT NULL,
    code_challenge          VARCHAR(255)  NOT NULL,
    code_challenge_method   VARCHAR(10)   NOT NULL DEFAULT 'S256',
    scope                   VARCHAR(500),
    state                   VARCHAR(255),
    nonce                   VARCHAR(255),
    user_id                 BIGINT        REFERENCES auth.users(id),
    authorization_code      VARCHAR(255)  UNIQUE,
    code_used               BOOLEAN       NOT NULL DEFAULT FALSE,
    status                  VARCHAR(20)   NOT NULL DEFAULT 'PENDING',
    expires_at              TIMESTAMP     NOT NULL,
    created_at              TIMESTAMP     NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_auth_sessions_code      ON auth.authorization_sessions(authorization_code);
CREATE INDEX IF NOT EXISTS idx_auth_sessions_expires   ON auth.authorization_sessions(expires_at);

-- Seed default Enfoca frontend client for development
INSERT INTO auth.oauth2_clients (client_id, client_name, redirect_uris, allowed_scopes)
VALUES (
    'enfoca-frontend',
    'Enfoca React App',
    'http://localhost:3000/callback,http://localhost:5173/callback',
    'openid profile email'
) ON CONFLICT (client_id) DO NOTHING;
