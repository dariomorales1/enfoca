#!/bin/bash
set -e

REGION="us-east-2"
ECR_REGISTRY="$1"
IMAGE_TAG="${2:-latest}"

echo "Pulling secrets from AWS Secrets Manager..."

get_secret() {
  aws secretsmanager get-secret-value \
    --region "$REGION" \
    --secret-id "$1" \
    --query SecretString \
    --output text | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('$2',''))"
}

cat > .env <<EOF
ECR_REGISTRY=${ECR_REGISTRY}
IMAGE_TAG=${IMAGE_TAG}

JWT_SECRET_KEY=$(get_secret enfoca/jwt JWT_SECRET_KEY)

REDIS_HOST=$(get_secret enfoca/redis REDIS_HOST)
REDIS_PORT=$(get_secret enfoca/redis REDIS_PORT)
REDIS_PASSWORD=$(get_secret enfoca/redis REDIS_PASSWORD)

AUTH_DB_URL=$(get_secret enfoca/auth-db DB_URL)
AUTH_DB_USERNAME=$(get_secret enfoca/auth-db DB_USERNAME)
AUTH_DB_PASSWORD=$(get_secret enfoca/auth-db DB_PASSWORD)

POMODORO_DB_URL=$(get_secret enfoca/pomodoro-db DB_URL)
POMODORO_DB_USERNAME=$(get_secret enfoca/pomodoro-db DB_USERNAME)
POMODORO_DB_PASSWORD=$(get_secret enfoca/pomodoro-db DB_PASSWORD)

RABBITMQ_USERNAME=$(get_secret enfoca/rabbitmq RABBITMQ_USERNAME)
RABBITMQ_PASSWORD=$(get_secret enfoca/rabbitmq RABBITMQ_PASSWORD)
EOF

echo "Logging in to ECR..."
aws ecr get-login-password --region "$REGION" | \
  docker login --username AWS --password-stdin "$ECR_REGISTRY"

echo "Pulling latest images..."
docker compose -f docker-compose.prod.yml pull

echo "Starting services..."
docker compose -f docker-compose.prod.yml up -d

echo "Deployment complete."
docker compose -f docker-compose.prod.yml ps
