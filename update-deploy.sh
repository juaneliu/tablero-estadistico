#!/bin/bash

# Script de Actualización para Oracle Cloud
# Ejecutar con: bash update-deploy.sh

echo "🔄 Actualizando Tablero Estadístico en Oracle Cloud..."

# Variables
APP_NAME="tablero-estadistico"
APP_DIR="/var/www/$APP_NAME"

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

# 1. Parar PM2 temporalmente
log "Deteniendo aplicación..."
sudo -u $APP_NAME pm2 stop all

# 2. Actualizar código desde repositorio
log "Actualizando código desde GitHub..."
sudo -u $APP_NAME git -C $APP_DIR pull origin main

# 3. Instalar nuevas dependencias (si las hay)
log "Actualizando dependencias..."
sudo -u $APP_NAME bash -c "cd $APP_DIR && npm install"

# 4. Ejecutar migraciones de base de datos (si las hay)
log "Ejecutando migraciones de base de datos..."
sudo -u $APP_NAME bash -c "cd $APP_DIR && npx prisma migrate deploy"

# 5. Regenerar Prisma Client
log "Regenerando Prisma Client..."
sudo -u $APP_NAME bash -c "cd $APP_DIR && npx prisma generate"

# 6. Rebuild de la aplicación
log "Reconstruyendo aplicación..."
sudo -u $APP_NAME bash -c "cd $APP_DIR && npm run build"

# 7. Reiniciar PM2
log "Reiniciando aplicación..."
sudo -u $APP_NAME pm2 restart all

# 8. Recargar configuración de Nginx (solo si cambió)
log "Recargando Nginx..."
sudo nginx -t && sudo systemctl reload nginx

log "✅ Actualización completada!"
log "🌐 Tu aplicación actualizada está disponible en: http://tu-servidor-ip"
log "📋 Para ver logs: sudo -u $APP_NAME pm2 logs"
log "📋 Para monitorear: sudo -u $APP_NAME pm2 monit"
