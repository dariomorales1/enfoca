#!/usr/bin/env bash

# Colores ANSI para salida en consola
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Rutas base del proyecto desde este script
SCRIPT_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)
ROOT_DIR=$(dirname "$SCRIPT_DIR")
LOG_DIR="/tmp/enfoca"

SIN_FRONTEND=false
for arg in "$@"; do
  if [ "$arg" = "--sin-frontend" ]; then
    SIN_FRONTEND=true
  fi
done

# Estados para la tabla final
discovery_status="DOWN"
auth_status="DOWN"
ai_status="DOWN"
pomodoro_status="DOWN"
gateway_status="DOWN"
frontend_status="DOWN"

# Verifica si un puerto ya aparece en netstat
check_port() {
  local port="$1"
  netstat -an 2>/dev/null | grep -q ":$port"
}

# Inicia un proceso en background con nohup y guarda su PID
start_service() {
  local service_name="$1"
  local service_dir="$2"
  local log_file="$3"
  local pid_file="$4"
  local command="$5"

  if [ ! -d "$service_dir" ]; then
    printf "${RED}Error:${NC} directorio no encontrado para %s: %s\n" "$service_name" "$service_dir"
    return 1
  fi

  (
    cd "$service_dir" || exit 1
    nohup bash -lc "$command" > "$log_file" 2>&1 &
    echo $! > "$pid_file"
  )

  if [ -s "$pid_file" ]; then
    printf "${GREEN}[UP]${NC} %s iniciado (PID: %s)\n" "$service_name" "$(cat "$pid_file")"
    return 0
  fi

  printf "${RED}[DOWN]${NC} no se pudo iniciar %s\n" "$service_name"
  return 1
}

# Espera respuesta HTTP o contenido esperado en body
wait_for_http() {
  local service_name="$1"
  local url="$2"
  local expect_type="$3"
  local expect_value="$4"
  local timeout_seconds="$5"
  local interval_seconds="$6"

  local elapsed=0
  printf "Esperando %s (%s)" "$service_name" "$url"

  while [ "$elapsed" -lt "$timeout_seconds" ]; do
    if [ "$expect_type" = "code" ]; then
      local code
      code=$(curl -s -o /dev/null -w "%{http_code}" "$url" 2>/dev/null)
      if [ "$code" = "$expect_value" ]; then
        printf " %bOK%b\n" "$GREEN" "$NC"
        return 0
      fi
    else
      local body
      body=$(curl -s "$url" 2>/dev/null)
      if printf "%s" "$body" | grep -Eq '"status"[[:space:]]*:[[:space:]]*"UP"'; then
        printf " %bOK%b\n" "$GREEN" "$NC"
        return 0
      fi
    fi

    printf "."
    sleep "$interval_seconds"
    elapsed=$((elapsed + interval_seconds))
  done

  printf " %bTIMEOUT%b\n" "$RED" "$NC"
  return 1
}

# Imprime una fila de la tabla de estado con color
print_status() {
  local service_name="$1"
  local status="$2"

  if [ "$status" = "UP" ]; then
    printf "%-20s ${GREEN}[UP]${NC}\n" "$service_name"
  else
    printf "%-20s ${RED}[DOWN]${NC}\n" "$service_name"
  fi
}

mkdir -p "$LOG_DIR"
printf "Logs y PID en: %s\n" "$LOG_DIR"

# Validacion de Docker antes de iniciar contenedores
DOCKER_ERR=$(docker info 2>&1)
if [ $? -ne 0 ]; then
  printf "${RED}[ERR]${NC} Docker no responde.\n\n"
  if echo "$DOCKER_ERR" | grep -qi "npipe\|pipe/docker"; then
    printf "  Causa probable: Docker Desktop no termino de iniciar o esta en modo Windows.\n\n"
    printf "  Pasos para solucionarlo:\n"
    printf "  1. Abre Docker Desktop y espera a que diga 'Docker Desktop is running'\n"
    printf "  2. Clic derecho en el icono Docker (taskbar)\n"
    printf "     Si ves 'Switch to Linux containers' -> haz clic ahi\n"
    printf "  3. Si persiste, ejecuta en terminal:\n"
    printf "     ${CYAN}docker context use desktop-linux${NC}\n"
    printf "  4. Si WSL2 no esta instalado (PowerShell como Admin):\n"
    printf "     ${CYAN}wsl --install${NC}  y reinicia Windows\n"
  else
    printf "  Error: %s\n" "$DOCKER_ERR"
  fi
  printf "\n"
  exit 1
fi

# Levanta contenedores de soporte
for dir in auth-service pomodoro-service ai-service; do
  service_path="$ROOT_DIR/$dir"
  if [ -d "$service_path" ]; then
    printf "Iniciando contenedores en %s...\n" "$dir"
    (
      cd "$service_path" || exit 1
      docker compose up -d
    )
    if [ $? -ne 0 ]; then
      printf "${YELLOW}Advertencia:${NC} fallo al iniciar docker compose en %s\n" "$dir"
    fi
  else
    printf "${YELLOW}Advertencia:${NC} directorio no encontrado para docker compose: %s\n" "$dir"
  fi
done

# discovery-service
if check_port 8761; then
  printf "${YELLOW}Advertencia:${NC} puerto 8761 ya en uso, se omite arranque de discovery-service.\n"
else
  start_service \
    "discovery-service" \
    "$ROOT_DIR/discovery-service" \
    "$LOG_DIR/discovery-service.log" \
    "$LOG_DIR/discovery-service.pid" \
    "./mvnw spring-boot:run -Dspring-boot.run.profiles=local"
fi

if wait_for_http "discovery-service" "http://localhost:8761/actuator/health" "body" "UP" 120 3; then
  discovery_status="UP"
else
  discovery_status="DOWN"
fi

# auth-service
if check_port 8081; then
  printf "${YELLOW}Advertencia:${NC} puerto 8081 ya en uso, se omite arranque de auth-service.\n"
else
  start_service \
    "auth-service" \
    "$ROOT_DIR/auth-service" \
    "$LOG_DIR/auth-service.log" \
    "$LOG_DIR/auth-service.pid" \
    "./mvnw spring-boot:run -Dspring-boot.run.profiles=local"
fi

# ai-service
if check_port 8085; then
  printf "${YELLOW}Advertencia:${NC} puerto 8085 ya en uso, se omite arranque de ai-service.\n"
else
  start_service \
    "ai-service" \
    "$ROOT_DIR/ai-service" \
    "$LOG_DIR/ai-service.log" \
    "$LOG_DIR/ai-service.pid" \
    "./mvnw spring-boot:run -Dspring-boot.run.profiles=local"
fi

# pomodoro-service
if check_port 8082; then
  printf "${YELLOW}Advertencia:${NC} puerto 8082 ya en uso, se omite arranque de pomodoro-service.\n"
else
  start_service \
    "pomodoro-service" \
    "$ROOT_DIR/pomodoro-service" \
    "$LOG_DIR/pomodoro-service.log" \
    "$LOG_DIR/pomodoro-service.pid" \
    "./mvnw spring-boot:run -Dspring-boot.run.profiles=local"
fi

# Health checks puntuales solicitados
if wait_for_http "auth-service" "http://localhost:8081/auth/ping" "code" "200" 120 3; then
  auth_status="UP"
else
  auth_status="DOWN"
fi

if wait_for_http "ai-service" "http://localhost:8085/planes-estudio/ping" "code" "200" 120 3; then
  ai_status="UP"
else
  ai_status="DOWN"
fi

# Pomodoro se marca por disponibilidad de puerto
if check_port 8082; then
  pomodoro_status="UP"
else
  pomodoro_status="DOWN"
fi

# api-gateway
if check_port 8080; then
  printf "${YELLOW}Advertencia:${NC} puerto 8080 ya en uso, se omite arranque de api-gateway.\n"
else
  start_service \
    "api-gateway" \
    "$ROOT_DIR/api-gateway" \
    "$LOG_DIR/api-gateway.log" \
    "$LOG_DIR/api-gateway.pid" \
    "./mvnw spring-boot:run -Dspring-boot.run.profiles=local"
fi

if wait_for_http "api-gateway" "http://localhost:8080/auth/ping" "code" "200" 120 3; then
  gateway_status="UP"
else
  gateway_status="DOWN"
fi

# frontend
if [ "$SIN_FRONTEND" = true ]; then
  printf "${YELLOW}Advertencia:${NC} frontend omitido por flag --sin-frontend.\n"
  frontend_status="DOWN"
else
  if check_port 5173; then
    printf "${YELLOW}Advertencia:${NC} puerto 5173 ya en uso, se omite arranque de frontend.\n"
  else
    start_service \
      "frontend" \
      "$ROOT_DIR/EnfocaFront" \
      "$LOG_DIR/frontend.log" \
      "$LOG_DIR/frontend.pid" \
      "npm run dev -- --port 5173"
  fi

  if wait_for_http "frontend" "http://localhost:5173" "code" "200" 120 3; then
    frontend_status="UP"
  else
    frontend_status="DOWN"
  fi
fi

printf "\nEstado de servicios:\n"
printf "------------------------------\n"
print_status "discovery-service" "$discovery_status"
print_status "auth-service" "$auth_status"
print_status "ai-service" "$ai_status"
print_status "pomodoro-service" "$pomodoro_status"
print_status "api-gateway" "$gateway_status"
print_status "frontend" "$frontend_status"
printf "------------------------------\n"

printf "\nURLs utiles:\n"
printf "- Frontend: http://localhost:5173\n"
printf "- API Gateway: http://localhost:8080\n"
printf "- Eureka Dashboard: http://localhost:8761\n"
printf "- RabbitMQ UI: http://localhost:15672 (guest/guest)\n"

