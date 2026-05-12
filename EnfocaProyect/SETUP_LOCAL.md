# Setup local — Enfoca

## Requisitos

| Herramienta | Versión mínima | Notas |
|---|---|---|
| Java | 21 | |
| Docker Desktop | cualquiera | Ver sección de problemas comunes |
| Node.js | 18+ | |
| Git Bash | cualquiera | Necesario para los scripts `.sh` |

> Maven no es necesario instalarlo; cada servicio incluye `./mvnw`.

---

## 1. Clonar y situarse en la rama correcta

```bash
git clone https://github.com/dariomorales1/enfoca.git
cd enfoca/EnfocaProyect
git checkout feature/backend-services-integration
```

---

## 2. Crear el archivo `.env`

Crea el archivo `EnfocaProyect/.env` con el contenido que te comparte Felipe por privado.  
**No lo subas al repositorio** — está en `.gitignore`.

---

## 3. Levantar todo con el script

```bash
# Dar permisos (solo la primera vez)
chmod +x scripts/start-local.sh scripts/stop-local.sh

# Levantar todos los servicios y el frontend
./scripts/start-local.sh

# Levantar solo los servicios backend (sin frontend)
./scripts/start-local.sh --sin-frontend

# Detener todo
./scripts/stop-local.sh

# Detener todo incluyendo las bases de datos Docker
./scripts/stop-local.sh --con-docker
```

El script levanta automáticamente:
- Bases de datos PostgreSQL (auth-db, pomodoro-db, ai-db) + RabbitMQ
- discovery-service (Eureka) → auth-service, ai-service, pomodoro-service → api-gateway → frontend

---

## 4. Levantar cada servicio manualmente (sin scripts)

Si prefieres abrir una terminal por servicio en vez de usar el script, sigue este orden.  
Cada servicio ocupa su propia terminal — **no cierres las terminales mientras desarrollas**.

---

### Paso 1 — Bases de datos y RabbitMQ (Docker)

Abre **una terminal**, ve a cada carpeta y ejecuta:

```bash
# Terminal 1 — DB del auth-service (PostgreSQL en puerto 5434)
cd EnfocaProyect/auth-service
docker compose up -d

# Terminal 1 — DB del ai-service (PostgreSQL en puerto 5435)
cd EnfocaProyect/ai-service
docker compose up -d

# Terminal 1 — DB del pomodoro-service + RabbitMQ (PostgreSQL 5433 + RabbitMQ 5672)
cd EnfocaProyect/pomodoro-service
docker compose up -d
```

Verifica que los contenedores estén corriendo:
```bash
docker ps
# Debes ver: auth-db, ai-db, pomodoro-db, pomodoro-rabbitmq
```

---

### Paso 2 — Discovery Service (Eureka) · puerto 8761

> **Debe levantarse primero.** Los demás servicios se registran en él.

```bash
# Terminal 2
cd EnfocaProyect/discovery-service
./mvnw spring-boot:run -Dspring-boot.run.profiles=local
```

Espera hasta ver en la consola:
```
Started DiscoveryServiceApplication in X seconds
```
Luego abre http://localhost:8761 y verifica que el dashboard de Eureka cargue.

---

### Paso 3 — Auth Service · puerto 8081

```bash
# Terminal 3
cd EnfocaProyect/auth-service
./mvnw spring-boot:run -Dspring-boot.run.profiles=local
```

Espera hasta ver:
```
Started AuthServiceApplication in X seconds
```

---

### Paso 4 — AI Service · puerto 8085

```bash
# Terminal 4
cd EnfocaProyect/ai-service
./mvnw spring-boot:run -Dspring-boot.run.profiles=local
```

Espera hasta ver:
```
Started AiServiceApplication in X seconds
```

---

### Paso 5 — Pomodoro Service · puerto 8082

```bash
# Terminal 5
cd EnfocaProyect/pomodoro-service
./mvnw spring-boot:run -Dspring-boot.run.profiles=local
```

Espera hasta ver:
```
Started PomodoroServiceApplication in X seconds
```

---

### Paso 6 — API Gateway · puerto 8080

> **Levantarlo último.** Necesita que Eureka y los servicios ya estén registrados.

```bash
# Terminal 6
cd EnfocaProyect/api-gateway
./mvnw spring-boot:run -Dspring-boot.run.profiles=local
```

Espera hasta ver:
```
Started ApiGatewayApplication in X seconds
```

---

### Paso 7 — Frontend · puerto 5173

```bash
# Terminal 7
cd EnfocaProyect/EnfocaFront
npm install        # solo la primera vez
npm run dev
```

Abre http://localhost:5173

---

### Resumen de terminales

| Terminal | Servicio | Puerto |
|---|---|---|
| 1 | Docker (bases de datos + RabbitMQ) | 5433, 5434, 5435, 5672 |
| 2 | discovery-service (Eureka) | 8761 |
| 3 | auth-service | 8081 |
| 4 | ai-service | 8085 |
| 5 | pomodoro-service | 8082 |
| 6 | api-gateway | 8080 |
| 7 | Frontend (Vite) | 5173 |

> **Nota Windows:** En lugar de `./mvnw` usa `mvnw.cmd` si Git Bash te da problemas:
> ```cmd
> mvnw.cmd spring-boot:run -Dspring-boot.run.profiles=local
> ```

---

## 5. URLs locales

| Servicio         | URL                                        |
|------------------|--------------------------------------------|
| Frontend         | http://localhost:5173                      |
| API Gateway      | http://localhost:8080                      |
| Eureka Dashboard | http://localhost:8761                      |
| Swagger auth     | http://localhost:8081/swagger-ui/index.html |
| RabbitMQ UI      | http://localhost:15672 (guest / guest)     |

---

## Problemas comunes

### Docker: `failed to connect to the docker API at npipe:////./pipe/dockerDesktopLinuxEngine`

Este error significa que Docker Desktop no está corriendo en modo Linux o no terminó de iniciar.

**Solución paso a paso:**

**1. Verificar que Docker Desktop esté completamente iniciado**
- Busca el ícono de la ballena 🐳 en la barra de tareas (system tray)
- Debe decir **"Docker Desktop is running"** (no "starting")
- Si está iniciando, espera hasta que se estabilice

**2. Asegurarte de estar en modo Linux containers**
- Clic derecho en el ícono Docker en la taskbar
- Si ves **"Switch to Linux containers"** → haz clic ahí
- Si ves **"Switch to Windows containers"** → ya está correcto

**3. Corregir el contexto de Docker** (Git Bash o PowerShell)
```bash
docker context list
# Busca cuál tiene el asterisco (*) — debe ser "desktop-linux"

docker context use desktop-linux
```

**4. Si WSL2 no está instalado** (PowerShell como Administrador)
```powershell
wsl --install
```
Reinicia Windows y vuelve a abrir Docker Desktop.

**5. Reset de Docker Desktop** (último recurso)
```
Docker Desktop → Settings → Troubleshoot → Reset to factory defaults
```

---

### Maven no encuentra Java 21

```bash
# Verificar versión activa
java -version

# Si no es 21, instalar desde:
# https://adoptium.net/  (Eclipse Temurin 21)
# Luego configurar JAVA_HOME en variables de entorno
```

---

### Error de permisos en los scripts `.sh`

```bash
chmod +x scripts/start-local.sh scripts/stop-local.sh
```

---

### Los servicios tardan mucho en compilar la primera vez

La primera ejecución de cada servicio descarga todas las dependencias de Maven (~500MB total).  
Las siguientes ejecuciones son mucho más rápidas porque quedan cacheadas en `~/.m2/`.

---

### Puerto ya en uso

Si algún puerto está ocupado, el script lo detecta y salta ese servicio.  
Para liberar un puerto manualmente en Git Bash:

```bash
# Ejemplo: liberar el puerto 8080
netstat -ano | grep :8080
taskkill //F //PID <el_pid_que_aparece>
```
