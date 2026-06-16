-- Seeds: auth-service — 10 usuarios de prueba
-- IDs desde 100 para no colisionar con registros reales
-- Contraseña de todos: Enfoca2026!

CREATE EXTENSION IF NOT EXISTS pgcrypto;

SET search_path TO auth_ms, public;

INSERT INTO users (id, nombre, last_name, email, password_hash, role, active, created_at, updated_at) VALUES
  (100, 'Felipe',    'Ulloa',     'felipe@test.com',     crypt('Enfoca2026!', gen_salt('bf', 10)), 'USER', true, NOW() - INTERVAL '60 days', NOW()),
  (101, 'María',     'García',    'maria@test.com',      crypt('Enfoca2026!', gen_salt('bf', 10)), 'USER', true, NOW() - INTERVAL '55 days', NOW()),
  (102, 'Carlos',    'Mendoza',   'carlos@test.com',     crypt('Enfoca2026!', gen_salt('bf', 10)), 'USER', true, NOW() - INTERVAL '50 days', NOW()),
  (103, 'Ana',       'Martínez',  'ana@test.com',        crypt('Enfoca2026!', gen_salt('bf', 10)), 'USER', true, NOW() - INTERVAL '45 days', NOW()),
  (104, 'Diego',     'Rodríguez', 'diego@test.com',      crypt('Enfoca2026!', gen_salt('bf', 10)), 'USER', true, NOW() - INTERVAL '40 days', NOW()),
  (105, 'Sofía',     'López',     'sofia@test.com',      crypt('Enfoca2026!', gen_salt('bf', 10)), 'USER', true, NOW() - INTERVAL '35 days', NOW()),
  (106, 'Mateo',     'González',  'mateo@test.com',      crypt('Enfoca2026!', gen_salt('bf', 10)), 'USER', true, NOW() - INTERVAL '30 days', NOW()),
  (107, 'Valentina', 'Pérez',     'valentina@test.com',  crypt('Enfoca2026!', gen_salt('bf', 10)), 'USER', true, NOW() - INTERVAL '25 days', NOW()),
  (108, 'Sebastián', 'Torres',    'sebastian@test.com',  crypt('Enfoca2026!', gen_salt('bf', 10)), 'USER', true, NOW() - INTERVAL '20 days', NOW()),
  (109, 'Camila',    'Soto',      'camila@test.com',     crypt('Enfoca2026!', gen_salt('bf', 10)), 'USER', true, NOW() - INTERVAL '15 days', NOW())
ON CONFLICT DO NOTHING;

SELECT setval('users_id_seq', 200);
