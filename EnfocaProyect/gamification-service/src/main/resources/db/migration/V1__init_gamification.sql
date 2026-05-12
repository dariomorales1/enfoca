CREATE TABLE IF NOT EXISTS gamificacion (
                                            id          BIGSERIAL PRIMARY KEY,
                                            usuario_id  VARCHAR(36) NOT NULL UNIQUE,
    xp_total    INTEGER NOT NULL DEFAULT 0,
    nivel       INTEGER NOT NULL DEFAULT 1,
    created_at  TIMESTAMP DEFAULT NOW(),
    updated_at  TIMESTAMP DEFAULT NOW()
    );

CREATE TABLE IF NOT EXISTS insignias (
                                         id            BIGSERIAL PRIMARY KEY,
                                         codigo        VARCHAR(50) NOT NULL UNIQUE,
    nombre        VARCHAR(100) NOT NULL,
    descripcion   VARCHAR(255),
    icono         VARCHAR(10),
    xp_requerido  INTEGER DEFAULT 0,
    condicion     VARCHAR(100)
    );

CREATE TABLE IF NOT EXISTS usuario_insignias (
                                                 id               BIGSERIAL PRIMARY KEY,
                                                 usuario_id       VARCHAR(36) NOT NULL,
    insignia_id      BIGINT REFERENCES insignias(id),
    desbloqueada_at  TIMESTAMP DEFAULT NOW(),
    UNIQUE(usuario_id, insignia_id)
    );

INSERT INTO insignias (codigo, nombre, descripcion, icono, condicion) VALUES
                                                                          ('PRIMERA_SESION', 'Primera Sesión',   'Completaste tu primera sesión',          '🎯', 'PRIMERA_SESION'),
                                                                          ('SESIONES_10',    'Constancia',       'Completaste 10 sesiones',                '📚', 'SESIONES_10'),
                                                                          ('SESIONES_50',    'Dedicación Total', 'Completaste 50 sesiones',                '🏆', 'SESIONES_50'),
                                                                          ('RACHA_3',        'Racha Inicial',    'Racha de 3 días consecutivos',           '🔥', 'RACHA_3'),
                                                                          ('RACHA_7',        'Semana Perfecta',  'Racha de 7 días',                        '⚡', 'RACHA_7'),
                                                                          ('RACHA_30',       'Imparable',        'Racha de 30 días',                       '💎', 'RACHA_30'),
                                                                          ('XP_500',         'Ascendente',       'Acumulaste 500 XP',                      '⭐', 'XP_500'),
                                                                          ('XP_2000',        'Estudioso',        'Acumulaste 2000 XP',                     '🌟', 'XP_2000'),
                                                                          ('XP_5000',        'Élite Académica',  'Acumulaste 5000 XP',                     '🏅', 'XP_5000'),
                                                                          ('DEEP_FOCUS',     'Estado de Flow',   'Primera sesión Deep Focus completada',   '🧠', 'DEEP_FOCUS'),
                                                                          ('NIVEL_5',        'Nivel 5',          'Alcanzaste el nivel 5',                  '🚀', 'NIVEL_5'),
                                                                          ('NIVEL_10',       'Nivel 10',         'Alcanzaste el nivel 10',                 '👑', 'NIVEL_10'),
                                                                          ('MADRUGADOR',     'Madrugador',       'Próximamente disponible',                '🌅', NULL),
                                                                          ('NOCTURNO',       'Nocturno',         'Próximamente disponible',                '🌙', NULL),
                                                                          ('PLANIFICADOR',   'Planificador',     'Próximamente disponible',                '🗓️', NULL),
                                                                          ('CERTIFICADO',    'Certificado',      'Próximamente disponible',                '📜', NULL),
                                                                          ('EXPLORADOR',     'Explorador',       'Próximamente disponible',                '🗺️', NULL),
                                                                          ('MENTOR',         'Mentor',           'Próximamente disponible',                '🤝', NULL),
                                                                          ('PERFECCIONISTA', 'Perfeccionista',   'Próximamente disponible',                '✨', NULL),
                                                                          ('LEYENDA',        'Leyenda',          'Próximamente disponible',                '🦁', NULL);