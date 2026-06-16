# Enfoca — Plataforma de Aprendizaje Profundo

Aplicación web de productividad académica basada en la técnica Pomodoro, planes de estudio generados con IA, sistema de gamificación y certificación de conocimientos.

---

## Tabla de contenidos

- [Descripción general](#descripción-general)
- [Arquitectura](#arquitectura)
- [Stack tecnológico](#stack-tecnológico)
- [Microservicios](#microservicios)
- [Requisitos previos](#requisitos-previos)
- [Levantar el entorno local](#levantar-el-entorno-local)
- [Variables de entorno](#variables-de-entorno)
- [Estructura del proyecto](#estructura-del-proyecto)
- [Funcionalidades principales](#funcionalidades-principales)
- [Tests](#tests)
- [Despliegue en producción](#despliegue-en-producción)

---

## Descripción general

**Enfoca** combina el método Pomodoro con inteligencia artificial para generar planes de estudio personalizados, medir el progreso del usuario, otorgar insignias y emitir certificados verificables con código QR.

El sistema está diseñado como una plataforma **multi-tenant** donde los usuarios pueden:

- Generar planes de estudio con IA a partir de una materia, objetivo y nivel
- Estudiar con el temporizador Pomodoro (modo normal y Deep Focus con música lofi)
- Validar planes de la comunidad y acceder a un catálogo de planes congelados
- Obtener insights semanales generados por LLM sobre sus métricas de estudio
- Rendir exámenes de certificación evaluados por IA y recibir un PDF con QR verificable
- Compartir certificados en LinkedIn y X/Twitter

---

## Arquitectura

```
┌─────────────────────────────────────────────────────────┐
│                      Frontend (React)                    │
│                    localhost:5173 / :80                  │
└──────────────────────────┬──────────────────────────────┘
                           │ HTTP
                    ┌──────▼──────┐
                    │ API Gateway │  :8080
                    │ (Spring CG) │
                    └──────┬──────┘
           JWT filter │    │ Routing / BFF
     ┌─────────────┬─┘  ┌─┴───────────────────┐
     │             │    │                      │
 ┌───▼───┐  ┌──────▼──┐ │ ┌────────┐ ┌──────┐ │
 │  Auth │  │Pomodoro │ │ │   AI   │ │Gamif.│ │
 │ :8081 │  │  :8082  │ │ │ :8085  │ │:8088 │ │
 └───┬───┘  └────┬────┘ │ └───┬────┘ └──┬───┘ │
     │           │      │     │          │     │
  ┌──▼──┐   ┌────▼────┐ │ ┌──▼──┐   ┌───▼──┐  │
  │auth │   │pomodoro │ │ │ai-db│   │gamif.│  │
  │ db  │   │   db    │ │ │     │   │  db  │  │
  └─────┘   └─────────┘ │ └─────┘   └──────┘  │
                        │                      │
                    ┌───▼─────┐  ┌──────────┐  │
                    │Metrics  │  │  Certif. │  │
                    │  :8083  │  │   :8086  │  │
                    └───┬─────┘  └────┬─────┘  │
                        │             │         │
                    ┌───▼──┐    ┌─────▼──┐     │
                    │metr. │    │ cert.  │     │
                    │  db  │    │   db   │     │
                    └──────┘    └────────┘     │
                        └──────────────────────┘
                    ┌────────────┐  ┌──────────┐
                    │ RabbitMQ  │  │  Redis   │
                    │  :5672    │  │  :6379   │
                    └────────────┘  └──────────┘
                    ┌──────────────────────────┐
                    │  Eureka Discovery :8761  │
                    └──────────────────────────┘
```

Todos los microservicios se registran en **Eureka** para descubrimiento de servicios. El **API Gateway** actúa como punto de entrada único, aplica el filtro JWT y enruta las peticiones. Los eventos de finalización de sesión Pomodoro se propagan vía **RabbitMQ** al ai-service y al gamification-service. **Redis** gestiona la caché de rutas y rate limiting en el Gateway.

---

## Stack tecnológico

### Backend
| Tecnología | Versión | Uso |
|---|---|---|
| Java | 21 | Lenguaje base |
| Spring Boot | 4.0.6 | Framework de microservicios |
| Spring Cloud Gateway | — | API Gateway y enrutamiento |
| Spring Cloud Netflix Eureka | — | Registro y descubrimiento de servicios |
| Spring Data JPA | — | Acceso a datos relacionales |
| Spring AMQP | — | Mensajería con RabbitMQ |
| Spring Data Redis | — | Caché reactiva |
| PostgreSQL | 15 | Base de datos relacional (una por servicio) |
| Flyway | — | Migraciones de esquema de BD |
| RabbitMQ | 3 | Mensajería asíncrona entre servicios |
| Redis | 7 | Caché y rate limiting |
| Groq API | — | LLM para generación de planes e insights |
| OpenPDF | 2.0.3 | Generación de certificados en PDF |
| ZXing | 3.5.3 | Generación de códigos QR |
| JWT (JJWT) | — | Autenticación stateless |
| JUnit 5 + Mockito | — | Tests unitarios e integración |

### Frontend
| Tecnología | Versión | Uso |
|---|---|---|
| React | 19 | Framework UI |
| Vite | 8 | Build tool y dev server |
| React Router | 7 | Navegación SPA |
| Tailwind CSS | 4 | Estilos utilitarios |
| Axios | 1 | Cliente HTTP |
| Recharts | 3 | Gráficos de métricas |
| Lucide React | — | Iconografía |
| Vitest + Testing Library | — | Tests de componentes y servicios |

### Infraestructura
| Herramienta | Uso |
|---|---|
| Docker + Docker Compose | Contenedores de desarrollo y producción |
| Nginx | Servidor estático del frontend en producción |

---

## Microservicios

| Servicio | Puerto | Base de datos | Descripción |
|---|---|---|---|
| `discovery-service` | 8761 | — | Registro Eureka |
| `api-gateway` | 8080 | Redis | Punto de entrada, filtro JWT, BFF |
| `auth-service` | 8081 | `enfoca_auth` (5434) | Registro, login, refresh, perfil |
| `pomodoro-service` | 8082 | `enfoca` (5433) | Timer Pomodoro, sesiones, ciclos |
| `metrics-service` | 8083 | `enfoca_metrics` (5437) | Métricas, insights semanales con LLM |
| `ai-service` | 8085 | `enfoca_planes` (5435) | Planes con IA, catálogo, validación comunitaria |
| `certification-service` | 8086 | `enfoca_cert` (5438) | Exámenes, certificados PDF/QR, Open Badges 2.0 |
| `gamification-service` | 8088 | `enfoca_gamification` (5436) | XP, niveles, insignias |

---

## Requisitos previos

- **Java 21+**
- **Maven 3.9+**
- **Node.js 20+** y **npm**
- **Docker** y **Docker Compose**
- Cuenta en **Groq** para obtener una API key (LLM gratuito)

---

## Levantar el entorno local

### 1. Clonar el repositorio

```bash
git clone <url-del-repositorio>
cd EnfocaProyect
```

### 2. Configurar variables de entorno

Copiar el archivo de ejemplo y completar los valores:

```bash
cp .env.example .env
```

Editar `.env` con los valores reales (ver sección [Variables de entorno](#variables-de-entorno)).

### 3. Levantar infraestructura con Docker

```bash
# Levantar bases de datos, RabbitMQ, Redis y todos los microservicios
docker compose up -d

# Verificar que todos los contenedores estén UP
docker compose ps
```

### 4. Levantar el frontend

```bash
cd EnfocaFront
npm install
npm run dev
```

El frontend estará disponible en `http://localhost:5173`.

### 5. Verificar el stack

- **Eureka Dashboard:** `http://localhost:8761`
- **RabbitMQ Management:** `http://localhost:15672` (guest/guest)
- **API Gateway:** `http://localhost:8080`
- **Frontend:** `http://localhost:5173`

---

## Variables de entorno

El archivo `.env` en la raíz del proyecto contiene la configuración compartida entre servicios. Las variables más importantes son:

| Variable | Descripción |
|---|---|
| `GROQ_API_KEY` | API key de Groq para el LLM |
| `JWT_SECRET` | Clave secreta para firmar tokens JWT (mín. 256 bits) |
| `GROQ_MODEL` | Modelo a usar (ej. `llama-3.3-70b-versatile`) |
| `RABBITMQ_HOST` | Host de RabbitMQ (por defecto `localhost`) |
| `REDIS_HOST` | Host de Redis (por defecto `localhost`) |

Para producción, las credenciales de bases de datos y la JWT secret se configuran mediante variables de entorno inyectadas en el servidor (no se commitean al repositorio).

---

## Estructura del proyecto

```
EnfocaProyect/
├── EnfocaFront/                  # Frontend React + Vite
│   ├── src/
│   │   ├── pages/                # Páginas principales
│   │   ├── components/           # Componentes reutilizables
│   │   ├── services/             # Clientes HTTP (api.jsx)
│   │   ├── router/               # Rutas (PUBLIC, PRIVATE, OPEN, FULLSCREEN)
│   │   ├── context/              # AuthContext
│   │   └── test/                 # Tests Vitest + Testing Library
│   ├── Dockerfile                # Imagen Nginx para producción
│   └── nginx.conf                # Configuración Nginx (SPA fallback)
│
├── api-gateway/                  # Spring Cloud Gateway
├── auth-service/                 # Autenticación y perfiles
├── ai-service/                   # Planes de estudio con IA
├── pomodoro-service/             # Timer y sesiones Pomodoro
├── metrics-service/              # Métricas e insights
├── gamification-service/         # XP, niveles e insignias
├── certification-service/        # Exámenes, PDF y Open Badges
├── discovery-service/            # Eureka Server
├── common-lib/                   # Clases compartidas entre servicios
│
├── docker-compose.yml            # Stack completo de desarrollo
├── docker-compose.prod.yml       # Stack completo de producción
├── docker-compose.prod.backend.yml  # Solo backend en producción
├── docker-compose.prod.pasarela.yml # Gateway en producción
├── scripts/
│   ├── build-and-push.sh         # Build y push de imágenes Docker
│   ├── deploy-backend.sh         # Deploy de microservicios
│   └── deploy-frontend.sh        # Deploy del frontend
└── pom.xml                       # POM padre Maven multi-módulo
```

---

## Funcionalidades principales

### Autenticación (RF-01, RF-02)
- Registro con nombre, apellido y email
- Login con JWT (access token 15 min + refresh token 7 días)
- Renovación automática de tokens en el frontend
- Recuperación de contraseña por email

### Perfil de usuario (RF-03)
- Edición de datos personales y cambio de contraseña
- Vitrina de logros: insignias desbloqueadas y certificados obtenidos

### Timer Pomodoro (RF-04)
- Configuración personalizada: duración de foco, descanso corto/largo, ciclos
- Modo normal con panel de temario lateral
- Modo **Deep Focus** (pantalla completa, fondo animado)
- Reproductor de música lofi integrado con 5 pistas y controles prev/next

### Música lofi (RF-05)
- 5 canales de radio: Lofi Hip Hop, Chillhop (SomaFM Groove Salad), Lofi Chill, Jazz & Fusion (SomaFM Sonic Universe), Deep Focus
- Cambio de pista sin superposición de audio
- Sincronizado con la fase del timer (play en RUNNING, pause en descanso)

### Planes de estudio con IA (RF-09)
- Generación de plan estructurado en módulos y temas con subtemas descriptivos
- Progreso secuencial con checkboxes
- Cuestionario socrático al completar cada módulo
- Clonación de planes del catálogo comunitario

### Validación comunitaria y catálogo (RF-10, RF-11, RF-12)
- Los usuarios valoran planes ajenos (1-5 estrellas)
- Planes con ratio ≥ 90% pasan a estado CONGELADO y aparecen en el catálogo
- Planes con bajo ratio se regeneran automáticamente con IA

### Dashboard de métricas (RF-07)
- Total de pomodoros, tiempo de estudio, racha de días consecutivos
- Gráfico de distribución semanal
- Comparativa semana actual vs anterior

### Insights con IA (RF-13)
- Análisis semanal personalizado generado por LLM con base en las métricas reales
- Cached por semana para no regenerar innecesariamente

### Gamificación (RF-08)
- Sistema de XP y niveles progresivos
- Más de 19 insignias desbloqueables (primera sesión, racha de 7 días, 100 pomodoros, etc.)

### Examen de certificación (RF-14)
- 10 preguntas generadas por IA sobre el contenido del plan completado
- Aprobado con puntaje ≥ 7/10 (3 intentos máximos)
- Identificación de temas a repasar en caso de reprobación

### Certificado PDF con QR (RF-15)
- PDF con diseño: fondo blanco, banda violeta, acento ámbar, QR en esquina inferior derecha
- Código de verificación único (UUID) almacenado en PostgreSQL

### Verificación pública (RF-16)
- URL pública `enfoca.online/verificar/{codigo}` accesible sin login
- Muestra nombre del titular, plan, puntaje y fecha de emisión

### Open Badges 2.0 (RF-17)
- Endpoints JSON-LD compatibles con el estándar IMS Open Badges 2.0
- `GET /certificacion/issuer` · `GET /certificacion/badges/{planId}` · `GET /certificacion/assertions/{certId}`

### Compartir certificado (RF-18)
- Botones de compartición en LinkedIn y X/Twitter con URL prellenada
- Copiar enlace al portapapeles con feedback visual

---

## Tests

### Frontend

```bash
cd EnfocaFront

# Ejecutar todos los tests
npm test

# Ejecutar una suite específica
npm test -- LoginPage
npm test -- RegisterPage
npm test -- AuthContext
npm test -- api.test

# Cobertura
npm run test:coverage
```

Las suites cubren: `LoginPage` (18 tests), `RegisterPage` (20 tests), `AuthContext` (13 tests), `api.jsx` (14 tests).

### Backend

```bash
# Todos los módulos
mvn test

# Un servicio específico
mvn test -pl auth-service
mvn test -pl ai-service
mvn test -pl certification-service
mvn test -pl metrics-service
mvn test -pl gamification-service
mvn test -pl pomodoro-service
mvn test -pl api-gateway
```

Cobertura de tests backend: servicios de autenticación, JWT, planes de estudio, gamificación, métricas, insights, certificación y rutas del Gateway.

---

## Despliegue en producción

### Build y push de imágenes

```bash
cd scripts
chmod +x *.sh
./build-and-push.sh
```

### Deploy del backend

```bash
./deploy-backend.sh
```

Usa `docker-compose.prod.yml` con variables de entorno inyectadas desde el servidor.

### Deploy del frontend

```bash
./deploy-frontend.sh
```

Construye la imagen Nginx con el build de React y la despliega en el servidor.

### Configuración de producción

Los archivos `application-prod.yml` de cada servicio leen la configuración desde variables de entorno del sistema. No incluyen credenciales hardcodeadas.

Para configurar el servidor de producción, crear el archivo `/opt/enfoca/.env` con las variables correspondientes (ver `.env.example` como referencia).

---

## Licencia

Proyecto académico desarrollado para el programa de estudios de Ingeniería en Informática.
