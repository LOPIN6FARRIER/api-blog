# Migración: About Me

## Descripción
Esta migración crea las tablas necesarias para almacenar la información del perfil "About Me" que se muestra en la página principal.

## Estructura de tablas

### `about_me`
Tabla principal que almacena la información del perfil (solo debe existir un registro).

### `about_me_skills`
Habilidades técnicas (relación 1:N).

### `about_me_interests`
Intereses personales (relación 1:N).

### `about_me_socials`
Enlaces a redes sociales (relación 1:N).

## Cómo ejecutar la migración

### Opción 1: Usando psql (PostgreSQL CLI)
```bash
psql -U your_username -d your_database -f migrations/add-about-me-table.sql
```

### Opción 2: Desde el código Node.js
Crear un script en `scripts/run-migration.ts`:

```typescript
import pool from '../src/database/connection.js';
import fs from 'fs';
import path from 'path';

async function runMigration() {
  try {
    const sql = fs.readFileSync(
      path.join(process.cwd(), 'migrations', 'add-about-me-table.sql'),
      'utf-8'
    );
    
    await pool.query(sql);
    console.log('✅ Migration executed successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

runMigration();
```

Y ejecutarlo:
```bash
tsx scripts/run-migration.ts
```

### Opción 3: Manualmente con un cliente GUI
1. Abre tu cliente PostgreSQL (pgAdmin, DBeaver, etc.)
2. Conecta a tu base de datos
3. Copia y pega el contenido de `add-about-me-table.sql`
4. Ejecuta el script

## Datos iniciales
La migración incluye un INSERT con los datos actuales que están hardcodeados en el frontend:
- Nombre: Vinicio Esparza
- Título: Frontend Developer
- Skills: Typescript, React, Next.js, Node.js, Angular, Astro, SQL, NoSQL, Redis
- Intereses: Fotografía, Música, Programación, Comida
- Redes sociales: GitHub, LinkedIn, Twitter

## Endpoints API creados

### GET `/api/about-me`
Obtiene la información del perfil (público, no requiere autenticación).

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Vinicio Esparza",
    "title": "Frontend Developer",
    "location": "Guadalajara Jal., México",
    "bio": "...",
    "email": "vinicioesparza15@gmail.com",
    "image": "https://...",
    "quote": "Si dios no existe quien invento los travesaños ⚽️",
    "skills": ["Typescript", "React", ...],
    "interests": ["Fotografía", "Música", ...],
    "socials": [
      {
        "icon": "code",
        "href": "https://github.com/...",
        "label": "GitHub"
      }
    ],
    "createdAt": "2024-01-24T...",
    "updatedAt": "2024-01-24T..."
  }
}
```

### PUT `/api/about-me`
Actualiza la información del perfil (requiere autenticación).

**Body:**
```json
{
  "name": "Vinicio Esparza",
  "title": "Frontend Developer",
  "location": "Guadalajara Jal., México",
  "bio": "...",
  "email": "vinicioesparza15@gmail.com",
  "image": "https://...",
  "quote": "...",
  "skills": ["Typescript", "React", ...],
  "interests": ["Fotografía", "Música", ...],
  "socials": [
    {
      "icon": "code",
      "href": "https://github.com/...",
      "label": "GitHub"
    }
  ]
}
```

## Archivos creados

### Backend
- `migrations/add-about-me-table.sql` - Script de migración SQL
- `src/api/aboutme/aboutme.controller.ts` - Lógica de negocio
- `src/api/aboutme/aboutme.validator.ts` - Validación de datos
- `src/api/aboutme/aboutme.handler.ts` - Handlers HTTP
- `src/api/aboutme/aboutme.routes.ts` - Definición de rutas
- `src/api/routes.ts` - Registro de rutas (modificado)

### Frontend (próximo paso)
- Crear `src/Api/useAboutMe.ts` - Hook para consumir el endpoint
- Modificar `src/pages/Home.tsx` - Usar datos de la API en lugar de hardcodeados

## Verificación
Después de ejecutar la migración, verifica:

```sql
-- Ver el registro creado
SELECT * FROM about_me;

-- Ver las skills
SELECT * FROM about_me_skills ORDER BY sort_order;

-- Ver los intereses
SELECT * FROM about_me_interests ORDER BY sort_order;

-- Ver las redes sociales
SELECT * FROM about_me_socials ORDER BY sort_order;
```

## Rollback (si es necesario)
```sql
DROP TABLE IF EXISTS about_me_socials CASCADE;
DROP TABLE IF EXISTS about_me_interests CASCADE;
DROP TABLE IF EXISTS about_me_skills CASCADE;
DROP TABLE IF EXISTS about_me CASCADE;
DROP FUNCTION IF EXISTS update_about_me_updated_at() CASCADE;
```
