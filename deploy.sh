#!/bin/bash

# Script de Deploy para Oracle Cloud
# Ejecutar con: bash deploy.sh

echo "🚀 Iniciando deploy de Tablero Estadístico en Oracle Cloud..."

# Variables
APP_NAME="tablero-estadistico"
APP_DIR="/var/www/$APP_NAME"
REPO_URL="https://github.com/tu-usuario/tablero-estadistico.git"

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Función para logging
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

error() {
    echo -e "${RED}[ERROR] $1${NC}"
}

warning() {
    echo -e "${YELLOW}[WARNING] $1${NC}"
}

# 1. Actualizar sistema
log "Actualizando sistema..."
sudo apt update && sudo apt upgrade -y

# 2. Instalar dependencias del sistema
log "Instalando dependencias del sistema..."
sudo apt install -y curl wget git nginx postgresql postgresql-contrib

# 3. Instalar Node.js
log "Instalando Node.js..."
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# 4. Instalar PM2
log "Instalando PM2..."
sudo npm install -g pm2

# 5. Crear usuario para la aplicación
log "Creando usuario para la aplicación..."
sudo useradd -m -s /bin/bash $APP_NAME
sudo mkdir -p $APP_DIR
sudo chown $APP_NAME:$APP_NAME $APP_DIR

# 6. Configurar PostgreSQL
log "Configurando PostgreSQL..."
sudo -u postgres psql -c "CREATE USER admin WITH PASSWORD 'cambiar_password_seguro';"
sudo -u postgres psql -c "CREATE DATABASE tablero_estadistico_prod OWNER admin;"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE tablero_estadistico_prod TO admin;"

# 7. Clonar repositorio (si no existe)
if [ ! -d "$APP_DIR/.git" ]; then
    log "Clonando repositorio..."
    sudo -u $APP_NAME git clone $REPO_URL $APP_DIR
else
    log "Actualizando repositorio..."
    sudo -u $APP_NAME git -C $APP_DIR pull origin main
fi

# 8. Instalar dependencias de Node.js
log "Instalando dependencias de Node.js..."
sudo -u $APP_NAME bash -c "cd $APP_DIR && npm ci --production"

# 9. Configurar variables de entorno
log "Configurando variables de entorno..."
sudo -u $APP_NAME cp $APP_DIR/.env.production $APP_DIR/.env

# 10. Ejecutar migraciones de Prisma
log "Ejecutando migraciones de base de datos..."
sudo -u $APP_NAME bash -c "cd $APP_DIR && npx prisma migrate deploy"

# 11. Generar Prisma Client
log "Generando Prisma Client..."
sudo -u $APP_NAME bash -c "cd $APP_DIR && npx prisma generate"

# 12. Build de la aplicación
log "Construyendo aplicación para producción..."
sudo -u $APP_NAME bash -c "cd $APP_DIR && npm run build"

# 13. Configurar Nginx
log "Configurando Nginx..."
sudo cp $APP_DIR/nginx.conf /etc/nginx/sites-available/$APP_NAME
sudo ln -sf /etc/nginx/sites-available/$APP_NAME /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl restart nginx

# 14. Configurar PM2
log "Configurando PM2..."
sudo -u $APP_NAME bash -c "cd $APP_DIR && pm2 start ecosystem.config.json"
sudo -u $APP_NAME pm2 save
sudo -u $APP_NAME pm2 startup

# 15. Configurar firewall
log "Configurando firewall..."
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw --force enable

# 16. Configurar SSL con Let's Encrypt (opcional)
warning "Para configurar SSL, ejecuta después:"
warning "sudo apt install certbot python3-certbot-nginx"
warning "sudo certbot --nginx -d tu-dominio.com"

log "✅ Deploy completado!"
log "🌐 Tu aplicación debería estar disponible en: http://tu-servidor-ip"
log "📋 Para ver logs: sudo -u $APP_NAME pm2 logs"
log "📋 Para reiniciar: sudo -u $APP_NAME pm2 restart all"
