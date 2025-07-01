# Tablero Estadístico SAEM

Sistema de tablero estadístico para seguimiento y control.

## Tecnologías
- Next.js 15
- PostgreSQL
- Prisma ORM
- TypeScript
- Tailwind CSS

## Deploy en Oracle Cloud

1. Crear instancia Ubuntu 22.04
2. Ejecutar script de deploy:
   ```bash
   bash deploy.sh
   ```

## Configuración

1. Actualizar `.env.production` con los valores correctos
2. Cambiar dominio en `nginx.conf`
3. Configurar SSL con Let's Encrypt

## Scripts disponibles

- `npm run dev` - Servidor de desarrollo
- `npm run build` - Build de producción
- `npm run start` - Servidor de producción
