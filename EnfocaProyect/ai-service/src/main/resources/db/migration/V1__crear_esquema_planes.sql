CREATE SCHEMA IF NOT EXISTS planes;

CREATE TABLE IF NOT EXISTS planes.plan_estudio (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id      UUID         NOT NULL,
    titulo          VARCHAR(255) NOT NULL,
    objetivo        TEXT,
    nivel           VARCHAR(20)  NOT NULL DEFAULT 'BASICO',
    estado          VARCHAR(20)  NOT NULL DEFAULT 'ACTIVO',
    ratio_validaciones DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    total_validaciones INTEGER      NOT NULL DEFAULT 0,
    creado_en       TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS planes.modulo (
    id      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    plan_id UUID         NOT NULL REFERENCES planes.plan_estudio(id) ON DELETE CASCADE,
    orden   INTEGER      NOT NULL,
    titulo  VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS planes.tema (
    id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    modulo_id            UUID         NOT NULL REFERENCES planes.modulo(id) ON DELETE CASCADE,
    orden                INTEGER      NOT NULL,
    titulo               VARCHAR(255) NOT NULL,
    pomodoros_estimados  INTEGER      NOT NULL DEFAULT 3,
    pomodoros_completados INTEGER     NOT NULL DEFAULT 0,
    completado           BOOLEAN      NOT NULL DEFAULT FALSE,
    completado_en        TIMESTAMP
);

CREATE TABLE IF NOT EXISTS planes.validacion (
    id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    plan_id   UUID        NOT NULL REFERENCES planes.plan_estudio(id) ON DELETE CASCADE,
    usuario_id UUID       NOT NULL,
    puntaje   INTEGER     NOT NULL CHECK (puntaje BETWEEN 1 AND 5),
    comentario TEXT,
    creado_en TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (plan_id, usuario_id)
);

CREATE INDEX IF NOT EXISTS idx_plan_usuario   ON planes.plan_estudio(usuario_id);
CREATE INDEX IF NOT EXISTS idx_plan_estado    ON planes.plan_estudio(estado);
CREATE INDEX IF NOT EXISTS idx_modulo_plan    ON planes.modulo(plan_id);
CREATE INDEX IF NOT EXISTS idx_tema_modulo    ON planes.tema(modulo_id);
CREATE INDEX IF NOT EXISTS idx_validacion_plan ON planes.validacion(plan_id);
