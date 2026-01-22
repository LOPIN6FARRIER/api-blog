# Migración: Nuevos Tipos de Posts

## Descripción

Esta migración agrega soporte para 3 nuevos tipos de posts:

1. **Recommendation** - Recomendaciones de series, películas, libros, podcasts, etc.
2. **Rating** - Valoraciones individuales con calificación y comentario
3. **Ranking** - Listas ordenadas de ítems con rankings

## Pasos para Aplicar la Migración

### 1. Conectarse a PostgreSQL

```bash
psql -U blog_user -d vinicio_blog
```

### 2. Ejecutar el script de migración

```sql
\i migrations/add-new-post-types.sql
```

O desde la terminal:

```bash
psql -U blog_user -d vinicio_blog -f migrations/add-new-post-types.sql
```

### 3. Verificar que las tablas se crearon correctamente

```sql
-- Ver las nuevas tablas
\dt recommendations
\dt ratings
\dt rankings
\dt ranking_items

-- Verificar el enum actualizado
\dT+ post_type

-- Verificar el nuevo enum item_type
\dT+ item_type
```

## Estructura de las Nuevas Tablas

### recommendations
- `id` - UUID (FK a posts)
- `subject_title` - Título del item recomendado
- `recommendation_type` - Tipo (serie, película, libro, podcast, otro)
- `description` - Descripción
- `cover_image_url` - URL de la imagen de portada
- `cover_image_alt` - Texto alternativo
- `rating` - Calificación (0.0 - 10.0)
- `external_url` - URL externa
- `recommended_by_user` - Si fue recomendado por el usuario
- `compact` - Vista compacta

### ratings
- `id` - UUID (FK a posts)
- `subject_title` - Título del item calificado
- `item_type` - Tipo (serie, película, libro, podcast, otro)
- `cover_image_url` - URL de la imagen
- `cover_image_alt` - Texto alternativo
- `rating` - Calificación (0.0 - 10.0) **REQUERIDO**
- `liked` - Si le gustó o no (boolean)
- `comment` - Comentario sobre el item

### rankings
- `id` - UUID (FK a posts)
- `description` - Descripción del ranking
- `cover_image_url` - URL de la imagen de portada
- `cover_image_alt` - Texto alternativo

### ranking_items (relación 1:N con rankings)
- `id` - UUID
- `ranking_id` - UUID (FK a rankings)
- `rank` - Posición en el ranking
- `subject_title` - Título del item
- `item_type` - Tipo (serie, película, libro, podcast, otro)
- `cover_image_url` - URL de la imagen
- `cover_image_alt` - Texto alternativo
- `rating` - Calificación opcional
- `description` - Descripción del item
- `external_url` - URL externa
- `sort_order` - Orden de clasificación

## Cambios en el Backend

### Archivos Actualizados:

1. **src/types/post.d.ts** 
   - Agregado `ItemType` enum
   - Agregado `RecommendationPost`, `RatingPost`, `RankingPost` interfaces
   - Actualizado union type `Post`

2. **src/api/posts/posts.validator.ts**
   - Agregado schemas para los 3 nuevos tipos
   - Actualizado `unifiedCreatePostSchema` y `unifiedUpdatePostSchema`

3. **src/api/posts/posts.controller.ts**
   - Agregado campos en `DbRow` interface
   - Agregado función `fetchRankingItems()`
   - Actualizado `transformRowToPost()` con casos para nuevos tipos
   - Actualizado `FULL_SELECT_SQL` con LEFT JOINs
   - Actualizado `getPosts()` y `getPost()` para cargar ranking_items
   - Actualizado `createPost()` con casos para nuevos tipos
   - Actualizado `updatePost()` con casos para nuevos tipos
   - Actualizado `attachImageToPost()` con casos para nuevos tipos

4. **bd.md**
   - Documentación actualizada con las nuevas tablas
   - Vista `feed_view` actualizada

## Cambios en el Frontend

### Archivos Actualizados:

1. **src/types/posts/post.d.ts**
   - Renombrado `SPost` a `RecommendationPost`
   - Agregado `ItemType` type
   - Actualizado union type `Post`

2. **src/pages/CreatePost.tsx**
   - Agregado "Recommendation", "Ranking" y "Rating" al selector de tipos
   - Agregado estados para los 3 nuevos tipos
   - Agregado casos en preview (useMemo)
   - Agregado casos en handleSubmit con snake_case para API
   - Agregado lógica de upload de imágenes
   - Agregado formularios UI completos

## Ejemplo de Uso

### Crear una Recomendación:

```typescript
{
  "type": "recommendation",
  "slug": "mi-recomendacion-breaking-bad",
  "title": "Breaking Bad - Una obra maestra",
  "subject_title": "Breaking Bad",
  "recommendation_type": "serie",
  "description": "La mejor serie de televisión jamás creada",
  "rating": 9.8,
  "external_url": "https://www.imdb.com/title/tt0903747/"
}
```

### Crear una Calificación:

```typescript
{
  "type": "rating",
  "slug": "calificacion-the-wire",
  "title": "Mi Opinión sobre The Wire",
  "subject_title": "The Wire",
  "item_type": "serie",
  "rating": 9.5,
  "liked": true,
  "comment": "Una serie brillante sobre la sociedad americana"
}
```

### Crear un Ranking:

```typescript
{
  "type": "ranking",
  "slug": "top-10-series-favoritas",
  "title": "Mis 10 Series Favoritas",
  "description": "Las mejores series que he visto",
  "items": [
    {
      "rank": 1,
      "subject_title": "Breaking Bad",
      "item_type": "serie",
      "rating": 9.8
    },
    {
      "rank": 2,
      "subject_title": "The Wire",
      "item_type": "serie",
      "rating": 9.5
    }
  ]
}
```

## Testing

Después de aplicar la migración, prueba crear posts de los nuevos tipos desde el formulario CreatePost en el frontend.

## Rollback (si es necesario)

Si necesitas revertir los cambios:

```sql
-- Eliminar las nuevas tablas
DROP TABLE IF EXISTS ranking_items CASCADE;
DROP TABLE IF EXISTS rankings CASCADE;
DROP TABLE IF EXISTS ratings CASCADE;
DROP TABLE IF EXISTS recommendations CASCADE;

-- Eliminar el enum item_type
DROP TYPE IF EXISTS item_type CASCADE;

-- Recrear feed_view sin las nuevas tablas
-- (copiar el SQL del archivo bd.md versión anterior)
```

⚠️ **ADVERTENCIA**: El rollback eliminará todos los datos de los nuevos tipos de posts.
