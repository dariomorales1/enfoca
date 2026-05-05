CREATE SCHEMA IF NOT EXISTS metrics;

-- Resumen diario de métricas por usuario
CREATE TABLE metrics.daily_summaries (
                                         id              BIGSERIAL       PRIMARY KEY,
                                         user_id         BIGINT          NOT NULL,
                                         summary_date    DATE            NOT NULL,
                                         focused_minutes INTEGER         NOT NULL DEFAULT 0,
                                         sessions_count  INTEGER         NOT NULL DEFAULT 0,
                                         cycles_count    INTEGER         NOT NULL DEFAULT 0,
                                         created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
                                         updated_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
                                         UNIQUE (user_id, summary_date)
);

-- Streaks por usuario
CREATE TABLE metrics.streaks (
                                 id              BIGSERIAL       PRIMARY KEY,
                                 user_id         BIGINT          NOT NULL UNIQUE,
                                 current_streak  INTEGER         NOT NULL DEFAULT 0,
                                 longest_streak  INTEGER         NOT NULL DEFAULT 0,
                                 last_active_date DATE,
                                 updated_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

-- AI Insights semanales
CREATE TABLE metrics.ai_insights (
                                     id              BIGSERIAL       PRIMARY KEY,
                                     user_id         BIGINT          NOT NULL,
                                     week_start      DATE            NOT NULL,
                                     summary         TEXT            NOT NULL,
                                     best_day        VARCHAR(20),
                                     recommendation  TEXT,
                                     generated_at    TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
                                     UNIQUE (user_id, week_start)
);

CREATE INDEX idx_daily_summaries_user_date ON metrics.daily_summaries(user_id, summary_date);
CREATE INDEX idx_streaks_user              ON metrics.streaks(user_id);
CREATE INDEX idx_ai_insights_user_week     ON metrics.ai_insights(user_id, week_start);