#!/bin/bash
# Carga el .env raíz y corre un servicio con las variables de entorno correctas.
# Uso: ./scripts/run-local.sh auth-service
#      ./scripts/run-local.sh api-gateway

SERVICE=$1

if [ -z "$SERVICE" ]; then
  echo "Uso: $0 <nombre-servicio>"
  echo "Servicios disponibles: discovery-service, api-gateway, auth-service, pomodoro-service"
  exit 1
fi

ENV_FILE="$(dirname "$0")/../.env"

if [ ! -f "$ENV_FILE" ]; then
  echo "No se encontró .env en la raíz del proyecto. Copia .env.example y completa los valores."
  exit 1
fi

set -a
source "$ENV_FILE"
set +a

# Mapear variables genéricas a las específicas del servicio
export DB_URL="${SERVICE^^}_DB_URL"
DB_URL=$(eval echo "\${${SERVICE//-/_}_DB_URL}")
DB_USERNAME=$(eval echo "\${${SERVICE//-/_}_DB_USERNAME}")
DB_PASSWORD=$(eval echo "\${${SERVICE//-/_}_DB_PASSWORD}")
export DB_URL DB_USERNAME DB_PASSWORD

cd "$(dirname "$0")/../$SERVICE" || exit 1
./mvnw spring-boot:run
