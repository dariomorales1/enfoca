#!/bin/bash
# =============================================================
# Script: deploy-frontend.sh
# Descripción: Construye y despliega el frontend React con Nginx
# Ejecutar DENTRO de la EC2 frontend: bash deploy-frontend.sh
# Requiere: Node 20+, git, nginx instalados en la EC2
# =============================================================

set -e

REPO_URL="https://github.com/dariomorales1/enfoca.git"
BRANCH="develop"
APP_DIR="/opt/enfoca-frontend"
NGINX_ROOT="/var/www/enfoca"

echo "========================================"
echo " Enfoca — Deploy Frontend"
echo "========================================"

# Clonar o actualizar el repositorio
if [ -d "$APP_DIR" ]; then
  echo ">>> Actualizando repositorio..."
  cd "$APP_DIR"
  git fetch origin
  git checkout $BRANCH
  git pull origin $BRANCH
else
  echo ">>> Clonando repositorio..."
  git clone -b $BRANCH $REPO_URL $APP_DIR
  cd "$APP_DIR"
fi

# Ir al directorio del frontend
cd "$APP_DIR/EnfocaProyect/EnfocaFront"

# Configurar variable de entorno de producción
echo "VITE_API_URL=https://api.enfoca.online" > .env.production

echo ">>> Instalando dependencias..."
npm ci

echo ">>> Construyendo para producción..."
npm run build

echo ">>> Copiando archivos al directorio de Nginx..."
sudo mkdir -p $NGINX_ROOT
sudo cp -r dist/* $NGINX_ROOT/
sudo chown -R www-data:www-data $NGINX_ROOT

echo ">>> Configurando Nginx..."
sudo tee /etc/nginx/sites-available/enfoca << 'EOF'
server {
    listen 80;
    server_name enfoca.site www.enfoca.site;
    root /var/www/enfoca;
    index index.html;

    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml text/javascript;

    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    location / {
        try_files $uri $uri/ /index.html;
    }
}
EOF

sudo ln -sf /etc/nginx/sites-available/enfoca /etc/nginx/sites-enabled/enfoca
sudo nginx -t
sudo systemctl reload nginx

echo ""
echo "========================================"
echo " ✅ Frontend desplegado correctamente"
echo " URL: http://enfoca.site"
echo "========================================"
