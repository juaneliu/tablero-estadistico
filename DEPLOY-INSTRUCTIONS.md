# 🚀 INSTRUCCIONES DE DESPLIEGUE - TABLERO ESTADÍSTICO SAEM

## Preparación Completada ✅

**Cambios Listos para Despliegue:**
- ✅ Sitio completamente responsivo para móviles y tablets
- ✅ Navegación superior optimizada
- ✅ Dashboard adaptativo
- ✅ Sección de Entes Públicos con vista móvil
- ✅ Directorio OIC completamente responsivo
- ✅ Login responsivo
- ✅ Todas las tablas con vistas móviles
- ✅ Configuración de producción lista
- ✅ Scripts de despliegue actualizados

## 📋 PASOS PARA DESPLEGAR EN ORACLE CLOUD

### 1. Conectarse al Servidor
```bash
ssh tu-usuario@tu-servidor-oracle-cloud
```

### 2. Descargar y Ejecutar Script de Deploy
```bash
# Descargar el script actualizado
wget https://raw.githubusercontent.com/juaneliu/tablero-estadistico/main/deploy.sh

# Dar permisos
chmod +x deploy.sh

# Ejecutar deploy
sudo bash deploy.sh
```

### 3. Configurar Variables de Entorno (IMPORTANTE)
Después de que termine el script, editar las variables:
```bash
sudo -u tablero-estadistico nano /var/www/tablero-estadistico/.env
```

**Variables críticas a configurar:**
- `DATABASE_URL`: Conexión a PostgreSQL
- `JWT_SECRET`: Secret seguro de 32+ caracteres
- `NEXTAUTH_SECRET`: Secret seguro de 32+ caracteres
- `NEXTAUTH_URL`: URL de tu dominio (https://tu-dominio.com)

### 4. Verificar Aplicación
```bash
# Estado de PM2
sudo -u tablero-estadistico pm2 status

# Ver logs
sudo -u tablero-estadistico pm2 logs

# Estado de Nginx
sudo systemctl status nginx
```

### 5. Configurar SSL (Recomendado)
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d tu-dominio.com
```

## 🔧 COMANDOS ÚTILES POST-DEPLOY

### Reiniciar Aplicación
```bash
sudo -u tablero-estadistico pm2 restart all
```

### Actualizar desde Git
```bash
sudo -u tablero-estadistico git -C /var/www/tablero-estadistico pull origin main
sudo -u tablero-estadistico bash -c "cd /var/www/tablero-estadistico && npm run build"
sudo -u tablero-estadistico pm2 restart all
```

### Ver Logs en Tiempo Real
```bash
sudo -u tablero-estadistico pm2 logs --lines 100
```

### Monitoreo
```bash
sudo -u tablero-estadistico pm2 monit
```

## 🎯 CARACTERÍSTICAS DESPLEGADAS

### Responsividad Completa
- **Móviles (320px-768px)**: Vista optimizada con cards y navegación colapsable
- **Tablets (768px-1024px)**: Layout híbrido adaptativo
- **Desktop (1024px+)**: Experiencia completa con tablas y grids

### Secciones Mejoradas
- **Dashboard**: Grid responsivo con métricas adaptativas
- **Entes Públicos**: Cards móviles para sujetos obligados y autoridades
- **Directorio OIC**: Vista de cards en móvil, tabla en desktop
- **Login**: Completamente responsivo con logo adaptativo
- **Navegación**: Menu hamburguesa en móvil, barra completa en desktop

### Optimizaciones Técnicas
- Build optimizado para producción
- Servidor PM2 con clustering
- Nginx con compresión gzip
- SSL ready con Let's Encrypt
- Base de datos PostgreSQL configurada

## 🌐 URLs Importantes

- **Aplicación**: `https://tu-dominio.com`
- **Repositorio**: `https://github.com/juaneliu/tablero-estadistico`
- **Logs PM2**: `sudo -u tablero-estadistico pm2 logs`

## ⚠️ NOTAS IMPORTANTES

1. **Configurar las variables de entorno** antes de usar la aplicación
2. **Configurar SSL** para seguridad en producción
3. **Hacer backup** de la base de datos regularmente
4. **Monitorear logs** para detectar errores

---

**Estado**: ✅ LISTO PARA DESPLIEGUE
**Última actualización**: $(date)
**Versión**: Responsiva completa v1.0
