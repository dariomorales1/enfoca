#!/bin/bash
# =============================================================
# Script: deploy-backend.sh
# Descripción: Despliega todos los microservicios en EC2 backend
# Ejecutar DENTRO de la EC2: bash deploy-backend.sh
# =============================================================

set -e

ECR_REGISTRY="012619468144.dkr.ecr.us-east-2.amazonaws.com"
REGION="us-east-2"
IMAGE_TAG="${1:-latest}"

echo "========================================"
echo " Enfoca — Deploy Backend en EC2"
echo " Tag: $IMAGE_TAG"
echo "========================================"

# Login a ECR
echo ">>> Autenticando con ECR..."
aws ecr get-login-password --region $REGION \
  | docker login --username AWS --password-stdin $ECR_REGISTRY

# Verificar que existe el .env
if [ ! -f ".env" ]; then
  echo "❌ ERROR: No se encontró el archivo .env"
  echo "   Crea el .env a partir de .env.example y completa los valores"
  exit 1
fi

echo ">>> Descargando imágenes actualizadas..."
export IMAGE_TAG=$IMAGE_TAG
export ECR_REGISTRY=$ECR_REGISTRY

docker compose -f docker-compose.prod.yml pull

echo ">>> Reiniciando servicios..."
docker compose -f docker-compose.prod.yml up -d --remove-orphans

echo ">>> Estado de los contenedores:"
docker compose -f docker-compose.prod.yml ps

echo ""
echo "========================================"
echo " ✅ Deploy completado"
echo "========================================"
