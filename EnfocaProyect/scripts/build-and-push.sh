#!/bin/bash
# =============================================================
# Script: build-and-push.sh
# Descripción: Construye y sube todas las imágenes Docker a ECR
# Ejecutar desde la raíz del proyecto (EnfocaProyect/)
# Uso: bash scripts/build-and-push.sh [IMAGE_TAG]
# =============================================================

set -e

ECR_REGISTRY="012619468144.dkr.ecr.us-east-2.amazonaws.com"
REGION="us-east-2"
IMAGE_TAG="${1:-latest}"
AWS_PROFILE="${AWS_PROFILE:-enfoca}"
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

echo "========================================"
echo " Enfoca — Build & Push to ECR"
echo " Tag: $IMAGE_TAG"
echo " Registry: $ECR_REGISTRY"
echo "========================================"

# Login a ECR
echo ""
echo ">>> Autenticando con ECR..."
aws ecr get-login-password --region $REGION --profile $AWS_PROFILE \
  | docker login --username AWS --password-stdin $ECR_REGISTRY

SERVICES=(
  "discovery-service"
  "api-gateway"
  "auth-service"
  "pomodoro-service"
  "ai-service"
  "gamification-service"
  "metrics-service"
  "certification-service"
)

echo ">>> Construyendo desde: $PROJECT_ROOT"
echo ""

for SERVICE in "${SERVICES[@]}"; do
  echo "----------------------------------------"
  echo ">>> Procesando: $SERVICE"

  REPO_URI="$ECR_REGISTRY/enfoca/$SERVICE"

  docker build \
    --platform linux/amd64 \
    -t "$REPO_URI:$IMAGE_TAG" \
    -t "$REPO_URI:latest" \
    -f "$PROJECT_ROOT/$SERVICE/Dockerfile" \
    "$PROJECT_ROOT"

  docker push "$REPO_URI:$IMAGE_TAG"
  docker push "$REPO_URI:latest"

  echo ">>> ✅ $SERVICE subido"
  echo ""
done

echo "========================================"
echo " ✅ Todos los servicios subidos a ECR"
echo " Tag: $IMAGE_TAG"
echo "========================================"
