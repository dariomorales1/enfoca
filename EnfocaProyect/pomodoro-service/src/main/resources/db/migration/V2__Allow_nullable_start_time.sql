-- start_time es seteado por /begin, no por /start — debe ser nullable
ALTER TABLE pomodoro.pomodoro_sessions ALTER COLUMN start_time DROP NOT NULL;
