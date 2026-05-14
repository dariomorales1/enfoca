CREATE SCHEMA IF NOT EXISTS pomodoro;

SET search_path TO pomodoro;

CREATE TABLE IF NOT EXISTS pomodoro_sessions (
    id BIGSERIAL PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    topic_id BIGINT,
    session_type VARCHAR(50) NOT NULL,
    status VARCHAR(50) NOT NULL,
    duration_minutes INTEGER NOT NULL,
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_pomodoro_user_id ON pomodoro_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_pomodoro_status ON pomodoro_sessions(status);
CREATE INDEX IF NOT EXISTS idx_pomodoro_start_time ON pomodoro_sessions(start_time);