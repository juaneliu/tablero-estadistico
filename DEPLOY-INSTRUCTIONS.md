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

### ⚡ Actualización Rápida (Para Servidores Ya Configurados)
Para aplicaciones ya desplegadas, usa el script de actualización eficiente:
```bash
# Descargar script de actualización
wget https://raw.githubusercontent.com/juaneliu/tablero-estadistico/main/update-deploy.sh
chmod +x update-deploy.sh

# Ejecutar actualización (mucho más rápido)
sudo bash update-deploy.sh
```

Este script hace:
- ✅ Para la aplicación temporalmente
- ✅ Actualiza código desde GitHub
- ✅ Instala nuevas dependencias
- ✅ Ejecuta migraciones de DB
- ✅ Rebuild optimizado
- ✅ Reinicia servicios

### Reiniciar Aplicación
```bash
sudo -u tablero-estadistico pm2 restart all
```

### Actualizar Manualmente desde Git
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

- **Aplicación**: `http://160.34.215.19` ✅ **FUNCIONANDO**
- **Repositorio**: `https://github.com/juaneliu/tablero-estadistico`
- **Logs PM2**: `sudo tail -20 /var/log/pm2/tablero-out-1.log`

## ⚠️ NOTAS IMPORTANTES

1. **Configurar las variables de entorno** antes de usar la aplicación
2. **Configurar SSL** para seguridad en producción
3. **Hacer backup** de la base de datos regularmente
4. **Monitorear logs** para detectar errores

---

**Estado**: ✅ **DESPLEGADO EXITOSAMENTE**
**Última actualización**: 3 de julio de 2025
**Versión**: Responsiva completa v1.0

## 🎉 RESUMEN DEL DESPLIEGUE EXITOSO

### ✅ **Completado con Éxito:**
- **Responsividad Completa**: Móviles, tablets y desktop optimizados
- **Aplicación Funcionando**: PM2 ejecutándose correctamente
- **Base de Datos**: PostgreSQL configurada y migraciones aplicadas
- **Servidor Web**: Nginx configurado y funcionando
- **Build Optimizado**: Aplicación construida para producción
- **Actualización Eficiente**: Script de update-deploy.sh disponible

### 📱 **Mejoras Implementadas:**
- Dashboard completamente responsivo
- Navegación con menú hamburguesa en móvil
- Sección de Entes Públicos con vista de cards móviles
- Directorio OIC adaptativo (tabla desktop / cards móvil)
- Login responsivo con logo adaptativo
- Todas las tablas con alternativas móviles

### 🔄 **Para Futuras Actualizaciones:**
Usa el script eficiente: `sudo bash update-deploy.sh`

## 🛠️ SOLUCIÓN DE PROBLEMAS COMUNES

### Error de Puerto en Uso (EADDRINUSE)
Si ves errores de puerto 3000 en uso:
```bash
# Limpiar procesos PM2
sudo -u tablero-estadistico pm2 delete all

# Matar procesos en puerto 3000
sudo fuser -k 3000/tcp

# Reiniciar aplicación
sudo -u tablero-estadistico bash -c 'cd /var/www/tablero-estadistico && pm2 start server.js --name tablero-estadistico'
sudo -u tablero-estadistico pm2 save
```

### Ver Logs Rápidamente
Si `pm2 logs` se cuelga, usa:
```bash
# Logs de salida
sudo tail -20 /var/log/pm2/tablero-out-1.log

# Logs de errores
sudo tail -20 /var/log/pm2/tablero-error-1.log
```

### Archivos Estáticos no Cargan
Si CSS/JS no cargan correctamente:
```bash
# Verificar archivos estáticos
ls -la /var/www/tablero-estadistico/.next/static/

# Recargar Nginx
sudo nginx -t && sudo systemctl reload nginx
```

## 🔐 CREDENCIALES DE ACCESO

### Usuario Principal
- **Email**: `juan.landa@saem.gob.mx`
- **Contraseña**: `1234`
- **Rol**: ADMINISTRADOR

### Usuario Alternativo (Creado automáticamente)
- **Email**: `admin@saem.gob.mx`
- **Contraseña**: `admin123`
- **Rol**: ADMINISTRADOR

### 🌐 **Acceso a la Aplicación**
1. Navega a: **http://160.34.215.19**
2. Inicia sesión con cualquiera de los usuarios de arriba
3. ¡Disfruta de tu sitio completamente responsivo!
