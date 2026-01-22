-- ============================================
-- MIGRATION: Add Album Support to Music Posts
-- ============================================
-- Fecha: 2026-01-22
-- Descripción: Añade soporte para álbumes completos y mejora la integración con Spotify

-- 1. Añadir nuevos campos a la tabla music
ALTER TABLE music 
  ADD COLUMN IF NOT EXISTS music_type VARCHAR(20) DEFAULT 'track',
  ADD COLUMN IF NOT EXISTS spotify_id VARCHAR(100),
  ADD COLUMN IF NOT EXISTS spotify_url VARCHAR(500),
  ADD COLUMN IF NOT EXISTS apple_music_url VARCHAR(500),
  ADD COLUMN IF NOT EXISTS youtube_url VARCHAR(500),
  ADD COLUMN IF NOT EXISTS release_date DATE,
  ADD COLUMN IF NOT EXISTS total_tracks INTEGER,
  ADD COLUMN IF NOT EXISTS tracks JSONB;

-- 2. Añadir comentarios a las columnas
COMMENT ON COLUMN music.music_type IS 'Tipo de contenido musical: "track" para canciones individuales, "album" para álbumes completos';
COMMENT ON COLUMN music.spotify_id IS 'ID único de Spotify para el track o álbum';
COMMENT ON COLUMN music.spotify_url IS 'URL completa de Spotify para el contenido';
COMMENT ON COLUMN music.total_tracks IS 'Número total de tracks (solo para álbumes)';
COMMENT ON COLUMN music.tracks IS 'Array JSON con información de todos los tracks del álbum';

-- 3. Crear índices para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_music_type ON music(music_type);
CREATE INDEX IF NOT EXISTS idx_music_spotify_id ON music(spotify_id);
CREATE INDEX IF NOT EXISTS idx_music_release_date ON music(release_date);

-- 4. Actualizar registros existentes (marcar como 'track' si no tienen valor)
UPDATE music 
SET music_type = 'track' 
WHERE music_type IS NULL;

-- 5. Añadir constraint para music_type
ALTER TABLE music 
  ADD CONSTRAINT chk_music_type 
  CHECK (music_type IN ('track', 'album'));

-- ============================================
-- EJEMPLOS DE USO
-- ============================================

-- Ejemplo 1: Insertar un track individual
/*
INSERT INTO posts (slug, type, title, status, featured, category, tags, published_at)
VALUES ('bohemian-rhapsody', 'music', 'Bohemian Rhapsody', 'published', true, 'Rock', ARRAY['queen', 'classic rock'], NOW())
RETURNING id;

INSERT INTO music (
  id, 
  music_type, 
  spotify_id,
  spotify_url,
  audio_url, 
  audio_title, 
  artist, 
  album, 
  genre, 
  duration, 
  cover_url,
  release_date
) VALUES (
  '...', -- ID del post creado arriba
  'track',
  '6l8EbYRtQJYS8kV5FxAzLz',
  'https://open.spotify.com/track/6l8EbYRtQJYS8kV5FxAzLz',
  'https://open.spotify.com/track/6l8EbYRtQJYS8kV5FxAzLz',
  'Bohemian Rhapsody',
  'Queen',
  'A Night at the Opera',
  'Rock',
  '5:55',
  'https://i.scdn.co/image/ab67616d0000b273...',
  '1975-10-31'
);
*/

-- Ejemplo 2: Insertar un álbum completo
/*
INSERT INTO posts (slug, type, title, status, featured, category, tags, published_at)
VALUES ('abbey-road', 'music', 'Abbey Road', 'published', true, 'Rock', ARRAY['the beatles', 'classic'], NOW())
RETURNING id;

INSERT INTO music (
  id,
  music_type,
  spotify_id,
  spotify_url,
  audio_url,
  audio_title,
  artist,
  album,
  genre,
  duration,
  cover_url,
  release_date,
  total_tracks,
  tracks
) VALUES (
  '...', -- ID del post creado arriba
  'album',
  '0ETFjACtuP2ADo6LFhL6HN',
  'https://open.spotify.com/album/0ETFjACtuP2ADo6LFhL6HN',
  'https://open.spotify.com/album/0ETFjACtuP2ADo6LFhL6HN',
  'Abbey Road',
  'The Beatles',
  'Abbey Road',
  'Rock',
  '47:23',
  'https://i.scdn.co/image/ab67616d0000b273...',
  '1969-09-26',
  17,
  '[
    {
      "id": "...",
      "name": "Come Together",
      "trackNumber": 1,
      "duration": "4:19",
      "artists": ["The Beatles"],
      "explicit": false
    },
    {
      "id": "...",
      "name": "Something",
      "trackNumber": 2,
      "duration": "3:02",
      "artists": ["The Beatles"],
      "explicit": false
    }
  ]'::jsonb
);
*/

-- ============================================
-- ROLLBACK (si necesitas revertir)
-- ============================================
/*
-- Para revertir esta migración:
DROP INDEX IF EXISTS idx_music_type;
DROP INDEX IF EXISTS idx_music_spotify_id;
DROP INDEX IF EXISTS idx_music_release_date;

ALTER TABLE music 
  DROP CONSTRAINT IF EXISTS chk_music_type,
  DROP COLUMN IF EXISTS music_type,
  DROP COLUMN IF EXISTS spotify_id,
  DROP COLUMN IF EXISTS spotify_url,
  DROP COLUMN IF EXISTS apple_music_url,
  DROP COLUMN IF EXISTS youtube_url,
  DROP COLUMN IF EXISTS release_date,
  DROP COLUMN IF EXISTS total_tracks,
  DROP COLUMN IF EXISTS tracks;
*/
