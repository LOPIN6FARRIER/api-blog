# Guía de Implementación: Soporte de Álbumes en MusicPost

## 📋 Pasos a seguir

### 1. Base de Datos - Ejecutar Migración

**Archivo:** `migrations/add-music-album-support.sql`

```bash
# Conéctate a la base de datos PostgreSQL
psql -U blog_user -d vinicio_blog

# Ejecuta la migración
\i migrations/add-music-album-support.sql
```

**Campos que añade:**
- `music_type` - 'track' o 'album'
- `spotify_id` - ID de Spotify
- `spotify_url` - URL completa de Spotify
- `apple_music_url` - URL de Apple Music
- `youtube_url` - URL de YouTube
- `release_date` - Fecha de lanzamiento
- `total_tracks` - Número de tracks (para álbumes)
- `tracks` - JSON con lista de tracks del álbum

---

### 2. API Blog - Actualizar Tipos TypeScript

**Archivo:** `src/types/post.d.ts`

Actualizar la interfaz `AudioMedia`:

```typescript
export interface AudioMedia {
  url: string;
  title: string;
  artist: string;
  album?: string;
  genre?: string;
  duration: string; // "3:42"
  coverUrl?: string;
}
```

Actualizar la interfaz `MusicPost`:

```typescript
export interface MusicPost extends PostBase {
  type: "music";
  audio: AudioMedia;
  description?: string;
  lyrics?: string;
  spotifyUrl?: string;
  appleMusicUrl?: string;
  youtubeUrl?: string;
  // Nuevos campos
  musicType?: "track" | "album";
  spotifyId?: string;
  releaseDate?: string;
  totalTracks?: number;
  tracks?: Array<{
    id: string;
    name: string;
    trackNumber: number;
    duration: string;
    artists: string[];
    previewUrl: string | null;
    explicit: boolean;
  }>;
}
```

---

### 3. API Blog - Actualizar Controller

**Archivo:** `src/api/posts/posts.controller.ts`

#### 3.1 Actualizar `DbRow` interface (línea ~55):

```typescript
interface DbRow {
  // ... campos existentes ...
  
  // Music - Añadir nuevos campos
  audio_url?: string | null;
  audio_title?: string | null;
  artist?: string | null;
  album?: string | null;
  genre?: string | null;
  duration?: string | null;
  music_cover_url?: string | null;
  music_description?: string | null;
  // NUEVOS CAMPOS
  music_type?: string | null;
  spotify_id?: string | null;
  spotify_url?: string | null;
  apple_music_url?: string | null;
  youtube_url?: string | null;
  release_date?: string | null;
  total_tracks?: number | null;
  tracks?: any | null; // JSONB
  
  // ... resto de campos ...
}
```

#### 3.2 Actualizar función `transformRowToPost` (buscar el case "music"):

```typescript
case "music": {
  const musicPost: MusicPost = {
    ...base,
    type: "music",
    audio: {
      url: row.audio_url || "",
      title: row.audio_title || "",
      artist: row.artist || "",
      album: row.album,
      genre: row.genre,
      duration: row.duration || "",
      coverUrl: row.music_cover_url,
    },
    description: row.music_description,
    spotifyUrl: row.spotify_url,
    appleMusicUrl: row.apple_music_url,
    youtubeUrl: row.youtube_url,
    musicType: (row.music_type as "track" | "album") || "track",
    spotifyId: row.spotify_id,
    releaseDate: row.release_date,
    totalTracks: row.total_tracks,
    tracks: row.tracks, // Ya viene parseado de JSONB
  };
  return musicPost;
}
```

#### 3.3 Actualizar query de SELECT (buscar la query que hace JOIN con music):

Buscar algo como:
```sql
LEFT JOIN music m ON p.id = m.id
```

Y actualizar el SELECT para incluir los nuevos campos:

```sql
m.audio_url,
m.audio_title,
m.artist,
m.album,
m.genre,
m.duration,
m.cover_url as music_cover_url,
-- NUEVOS CAMPOS
m.music_type,
m.spotify_id,
m.spotify_url,
m.apple_music_url,
m.youtube_url,
m.release_date,
m.total_tracks,
m.tracks
```

#### 3.4 Actualizar función `createPost` (buscar el INSERT para music):

```typescript
case "music": {
  const musicData = post as MusicPost;
  
  // INSERT en tabla music
  await query(
    `INSERT INTO music (
      id, audio_url, audio_title, artist, album, genre, 
      duration, cover_url, 
      music_type, spotify_id, spotify_url, apple_music_url, 
      youtube_url, release_date, total_tracks, tracks
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)`,
    [
      postId,
      musicData.audio.url,
      musicData.audio.title,
      musicData.audio.artist,
      musicData.audio.album,
      musicData.audio.genre,
      musicData.audio.duration,
      musicData.audio.coverUrl,
      musicData.musicType || "track",
      musicData.spotifyId,
      musicData.spotifyUrl,
      musicData.appleMusicUrl,
      musicData.youtubeUrl,
      musicData.releaseDate,
      musicData.totalTracks,
      musicData.tracks ? JSON.stringify(musicData.tracks) : null,
    ]
  );
  break;
}
```

#### 3.5 Actualizar función `updatePost` (buscar el UPDATE para music):

```typescript
case "music": {
  const musicData = post as Partial<MusicPost>;
  
  // Construir SET dinámico
  const updates: string[] = [];
  const values: any[] = [];
  let paramCount = 1;

  if (musicData.audio?.url !== undefined) {
    updates.push(`audio_url = $${paramCount++}`);
    values.push(musicData.audio.url);
  }
  if (musicData.audio?.title !== undefined) {
    updates.push(`audio_title = $${paramCount++}`);
    values.push(musicData.audio.title);
  }
  if (musicData.audio?.artist !== undefined) {
    updates.push(`artist = $${paramCount++}`);
    values.push(musicData.audio.artist);
  }
  if (musicData.audio?.album !== undefined) {
    updates.push(`album = $${paramCount++}`);
    values.push(musicData.audio.album);
  }
  if (musicData.audio?.genre !== undefined) {
    updates.push(`genre = $${paramCount++}`);
    values.push(musicData.audio.genre);
  }
  if (musicData.audio?.duration !== undefined) {
    updates.push(`duration = $${paramCount++}`);
    values.push(musicData.audio.duration);
  }
  if (musicData.audio?.coverUrl !== undefined) {
    updates.push(`cover_url = $${paramCount++}`);
    values.push(musicData.audio.coverUrl);
  }
  
  // NUEVOS CAMPOS
  if (musicData.musicType !== undefined) {
    updates.push(`music_type = $${paramCount++}`);
    values.push(musicData.musicType);
  }
  if (musicData.spotifyId !== undefined) {
    updates.push(`spotify_id = $${paramCount++}`);
    values.push(musicData.spotifyId);
  }
  if (musicData.spotifyUrl !== undefined) {
    updates.push(`spotify_url = $${paramCount++}`);
    values.push(musicData.spotifyUrl);
  }
  if (musicData.appleMusicUrl !== undefined) {
    updates.push(`apple_music_url = $${paramCount++}`);
    values.push(musicData.appleMusicUrl);
  }
  if (musicData.youtubeUrl !== undefined) {
    updates.push(`youtube_url = $${paramCount++}`);
    values.push(musicData.youtubeUrl);
  }
  if (musicData.releaseDate !== undefined) {
    updates.push(`release_date = $${paramCount++}`);
    values.push(musicData.releaseDate);
  }
  if (musicData.totalTracks !== undefined) {
    updates.push(`total_tracks = $${paramCount++}`);
    values.push(musicData.totalTracks);
  }
  if (musicData.tracks !== undefined) {
    updates.push(`tracks = $${paramCount++}`);
    values.push(musicData.tracks ? JSON.stringify(musicData.tracks) : null);
  }

  if (updates.length > 0) {
    values.push(id);
    await query(
      `UPDATE music SET ${updates.join(", ")} WHERE id = $${paramCount}`,
      values
    );
  }
  break;
}
```

---

### 4. (OPCIONAL) Crear Endpoint Específico para Spotify

**Archivo:** `src/api/posts/posts.routes.ts`

Añadir una nueva ruta:

```typescript
router.post("/from-spotify", createPostFromSpotifyHandler);
```

**Archivo:** `src/api/posts/posts.handler.ts`

```typescript
import axios from "axios";

export async function createPostFromSpotifyHandler(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const { spotifyUrl, slug, title, category, tags, status = "published" } = req.body;

    if (!spotifyUrl) {
      res.status(400).json({ error: "spotifyUrl es requerido" });
      return;
    }

    // Llamar al API de Vinicio_Data
    const response = await axios.post(
      "http://localhost:3000/api/spotify/parse-music-post",
      { url: spotifyUrl, market: "MX" }
    );

    const musicData = response.data;

    // Crear el post
    const post: Partial<MusicPost> = {
      slug: slug || musicData.audio.title.toLowerCase().replace(/\s+/g, "-"),
      type: "music",
      title: title || musicData.audio.title,
      status,
      category,
      tags,
      audio: musicData.audio,
      description: musicData.description,
      spotifyUrl: musicData.spotifyUrl,
      spotifyId: musicData.spotifyId,
      appleMusicUrl: musicData.appleMusicUrl,
      youtubeUrl: musicData.youtubeUrl,
      musicType: musicData.musicType,
      releaseDate: musicData.releaseDate,
      totalTracks: musicData.totalTracks,
      tracks: musicData.tracks,
    };

    const result = await createPost(post as any);

    if (result.success) {
      res.status(201).json(result.data);
    } else {
      res.status(400).json({ error: result.error });
    }
  } catch (error: any) {
    res.status(500).json({ 
      error: error.message || "Error al crear post desde Spotify" 
    });
  }
}
```

---

## 🧪 Testing

### 1. Probar creación manual de un track:

```bash
POST http://localhost:3000/api/posts
Content-Type: application/json

{
  "slug": "test-track",
  "type": "music",
  "title": "Test Track",
  "status": "published",
  "audio": {
    "url": "https://open.spotify.com/track/xxx",
    "title": "Song Name",
    "artist": "Artist Name",
    "album": "Album Name",
    "genre": "Pop",
    "duration": "3:42",
    "coverUrl": "https://..."
  },
  "musicType": "track",
  "spotifyId": "xxx",
  "spotifyUrl": "https://open.spotify.com/track/xxx"
}
```

### 2. Probar endpoint directo de Spotify (si lo implementaste):

```bash
POST http://localhost:3000/api/posts/from-spotify
Content-Type: application/json

{
  "spotifyUrl": "https://open.spotify.com/track/2gpaJPUWNx2xmOwy2NNLu8",
  "slug": "my-favorite-song",
  "category": "Rock",
  "tags": ["música", "rock"]
}
```

### 3. Probar consulta:

```bash
GET http://localhost:3000/api/posts?type=music
```

---

## ✅ Checklist

- [ ] Ejecutar migración SQL
- [ ] Actualizar `post.d.ts` (tipos TypeScript)
- [ ] Actualizar `DbRow` interface en controller
- [ ] Actualizar `transformRowToPost` case "music"
- [ ] Actualizar query SELECT para incluir nuevos campos
- [ ] Actualizar `createPost` INSERT para music
- [ ] Actualizar `updatePost` UPDATE para music
- [ ] (Opcional) Crear endpoint `/from-spotify`
- [ ] Probar creación de track
- [ ] Probar creación de álbum
- [ ] Probar consulta de music posts

---

## 📝 Notas

- Los campos `tracks` en la BD es JSONB, se convierte automáticamente
- `musicType` por defecto es 'track'
- Todos los nuevos campos son opcionales excepto los campos base de `audio`
- El endpoint de Spotify en Vinicio_Data debe estar corriendo en puerto 3000
