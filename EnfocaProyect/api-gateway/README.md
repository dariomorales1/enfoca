# api-gateway

Punto único de entrada de la plataforma Enfoca. Actúa como pasarela API, BFF y capa de resiliencia.

## Puerto

`8080`

## Prerrequisitos

- `discovery-service` corriendo en `http://localhost:8761`
- Redis corriendo en `localhost:6379`

## Arranque local

```bash
./mvnw spring-boot:run
```

## Variables de entorno

| Variable          | Valor por defecto            | Descripción                        |
|-------------------|------------------------------|------------------------------------|
| `EUREKA_URL`      | `http://localhost:8761/eureka/` | URL del servidor Eureka          |
| `REDIS_HOST`      | `localhost`                  | Host de Redis                      |
| `REDIS_PORT`      | `6379`                       | Puerto de Redis                    |
| `REDIS_PASSWORD`  | _(vacío)_                    | Contraseña de Redis                |
| `JWT_SECRET_KEY`  | `cambiar_en_produccion`      | Clave secreta para validar JWT     |

## Endpoints BFF

| Endpoint              | Método | Descripción                                      |
|-----------------------|--------|--------------------------------------------------|
| `/bff/tablero`        | GET    | Agrega métricas, gamificación, plan y última sesión |
| `/bff/perfil-completo`| GET    | Agrega perfil, estadísticas, logros y certificados |

Ambos requieren header `Authorization: Bearer {token}`.

## Rutas de la pasarela

| Ruta del cliente        | Servicio destino       |
|-------------------------|------------------------|
| `/auth/**`              | `auth-service`         |
| `/perfil/**`            | `auth-service`         |
| `/sesiones-pomodoro/**` | `pomodoro-service`     |
| `/metricas/**`          | `metrics-service`      |
| `/planes-estudio/**`    | `study-plans-service`  |
| `/temas/**`             | `study-plans-service`  |
| `/gamificacion/**`      | `gamification-service` |
| `/certificacion/**`     | `certification-service`|
| `/verificar/**`         | `certification-service`|
| `/analisis-semanal/**`  | `weekly-analysis-service`|

## Arranque con Docker

```bash
docker build -t enfoca/api-gateway .
docker run -p 8080:8080 \
  -e EUREKA_URL=http://discovery-service:8761/eureka/ \
  -e REDIS_HOST=redis \
  -e JWT_SECRET_KEY=tu_clave_secreta \
  enfoca/api-gateway
```

## Ejecutar pruebas

```bash
./mvnw test
```
