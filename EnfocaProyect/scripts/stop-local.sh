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

CON_DOCKER=false
for arg in "$@"; do
  if [ "$arg" = "--con-docker" ]; then
    CON_DOCKER=true
  fi
done

# Verifica si un puerto ya aparece en netstat
check_port() {
  local port="$1"
  netstat -an 2>/dev/null | grep -q ":$port"
}

# Imprime estado de detencion por servicio
print_status() {
  local service_name="$1"
  local status="$2"

  if [ "$status" = "stopped" ]; then
    printf "${GREEN}[OK]${NC} %s detenido\n" "$service_name"
  else
    printf "${YELLOW}[SKIP]${NC} %s no encontrado\n" "$service_name"
  fi
}

# Mata proceso por archivo PID si existe
stop_by_pid() {
  local pid_file="$1"

  if [ ! -f "$pid_file" ]; then
    return 1
  fi

  local pid
  pid=$(cat "$pid_file" 2>/dev/null)

  if [ -n "$pid" ]; then
    kill "$pid" 2>/dev/null
    if [ $? -eq 0 ]; then
      return 0
    fi
  fi

  return 1
}

# Fallback para Windows/Git Bash: identifica PID por puerto y hace taskkill
stop_by_port_fallback() {
  local port="$1"
  local killed=false

  while IFS= read -r line; do
    [ -z "$line" ] && continue

    local pid
    pid=$(echo "$line" | awk '{print $5}' | tr -d '\r')

    if [ -n "$pid" ]; then
      taskkill //F //PID "$pid" >/dev/null 2>&1
      if [ $? -eq 0 ]; then
        killed=true
      fi
    fi
  done < <(netstat -ano 2>/dev/null | grep ":$port")

  if [ "$killed" = true ]; then
    return 0
  fi

  return 1
}

# Define servicios y puertos
services=(
  "discovery-service:8761"
  "auth-service:8081"
  "ai-service:8085"
  "pomodoro-service:8082"
  "api-gateway:8080"
  "frontend:5173"
)

# Detencion de servicios por PID y fallback por puerto
for item in "${services[@]}"; do
  service_name="${item%%:*}"
  port="${item##*:}"
  pid_file="$LOG_DIR/${service_name}.pid"

  stopped=false

  # Paso 1: kill usando PID file
  if stop_by_pid "$pid_file"; then
    stopped=true
  fi

  # Paso 2: fallback por puerto en caso de proceso remanente
  if check_port "$port"; then
    if stop_by_port_fallback "$port"; then
      stopped=true
    fi
  fi

  if [ "$stopped" = true ]; then
    print_status "$service_name" "stopped"
  else
    print_status "$service_name" "not_found"
  fi
done

# Baja contenedores si se solicita con flag
if [ "$CON_DOCKER" = true ]; then
  for dir in auth-service pomodoro-service ai-service; do
    service_path="$ROOT_DIR/$dir"
    if [ -d "$service_path" ]; then
      (
        cd "$service_path" || exit 1
        docker compose down
      )
      if [ $? -eq 0 ]; then
        printf "${GREEN}[OK]${NC} docker compose down en %s\n" "$dir"
      else
        printf "${YELLOW}[SKIP]${NC} no se pudo ejecutar docker compose down en %s\n" "$dir"
      fi
    else
      printf "${YELLOW}[SKIP]${NC} directorio no encontrado: %s\n" "$dir"
    fi
  done
fi

# Elimina archivos PID despues de la detencion
removed_any=false
if [ -d "$LOG_DIR" ]; then
  for pid_file in "$LOG_DIR"/*.pid; do
    if [ -f "$pid_file" ]; then
      rm -f "$pid_file"
      removed_any=true
    fi
  done
fi

if [ "$removed_any" = true ]; then
  printf "${GREEN}PID files eliminados en %s${NC}\n" "$LOG_DIR"
else
  printf "${YELLOW}No se encontraron PID files para eliminar en %s${NC}\n" "$LOG_DIR"
fi
