# Script de Creación de Usuario Admin

Este script crea un usuario administrador con plan PRO ilimitado en la base de datos.

## Requisitos

1. Instalar dependencias en el servidor backend:
```bash
npm install pg bcrypt dotenv
npm install --save-dev @types/pg @types/bcrypt tsx
```

2. Configurar variables de entorno en `.env`:
```
DATABASE_URL=postgresql://user:password@host:port/database
NODE_ENV=production
```

## Ejecución

### Opción 1: Con tsx (recomendado)
```bash
NODE_OPTIONS='--import tsx' node --env-file=.env server/create-admin.ts
```

### Opción 2: Con ts-node
```bash
npx ts-node --env-file=.env server/create-admin.ts
```

### Opción 3: Compilar y ejecutar
```bash
npx tsc server/create-admin.ts
node --env-file=.env server/create-admin.js
```

## Usuario Creado

- **Username:** George0572
- **Password:** Gas05720572!
- **Role:** admin
- **Plan:** pro (ilimitado, nunca expira)

## Notas

- El script usa `ON CONFLICT` para actualizar el usuario si ya existe
- La suscripción se establece para no expirar nunca (2099-12-31)
- El script cierra la conexión automáticamente al finalizar













