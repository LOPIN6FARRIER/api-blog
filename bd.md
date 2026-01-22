CREATE USER blog_user  WITH PASSWORD 'HWUIC723%&';
-- 2. Crear la base de datos
CREATE DATABASE vinicio_blog OWNER blog_user;

-- 3. Conectarte a la nueva base de datos
\c vinicio_blog

-- 4. Dar permisos completos al usuario
GRANT ALL PRIVILEGES ON DATABASE vinicio_blog TO blog_user;
GRANT ALL PRIVILEGES ON SCHEMA public TO blog_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO blog_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO blog_user;

-- 5. Permisos para tablas futuras
ALTER DEFAULT PRIVILEGES IN SCHEMA public 
GRANT ALL PRIVILEGES ON TABLES TO blog_user;

ALTER DEFAULT PRIVILEGES IN SCHEMA public 
GRANT ALL PRIVILEGES ON SEQUENCES TO blog_user;

CREATE TYPE post_type AS ENUM (
  'article',
  'photo',
  'gallery',
  'thought',
  'music',
  'video',
  'project',
  'link',
  'announcement',
  'event',
  'recommendation',
  'ranking',
  'rating'
);

CREATE TYPE post_status AS ENUM (
  'draft',
  'published',
  'archived'
);

CREATE TYPE thought_style AS ENUM (
  'quote',
  'note',
  'reflection'
);

CREATE TYPE project_status AS ENUM (
  'in_progress',
  'completed',
  'archived'
);

CREATE TYPE announcement_priority AS ENUM (
  'low',
  'normal',
  'urgent'
);

-- ============================================
-- POSTS (tabla principal)
-- ============================================

CREATE TABLE posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug VARCHAR(255) UNIQUE NOT NULL,
  type post_type NOT NULL,
  title VARCHAR(500) NOT NULL,
  status post_status DEFAULT 'draft',
  featured BOOLEAN DEFAULT FALSE,
  category VARCHAR(100),
  tags TEXT[], -- Array de tags
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  published_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_posts_type ON posts(type);
CREATE INDEX idx_posts_status ON posts(status);
CREATE INDEX idx_posts_featured ON posts(featured);
CREATE INDEX idx_posts_created_at ON posts(created_at DESC);
CREATE INDEX idx_posts_slug ON posts(slug);

-- ============================================
-- ARTICLES
-- ============================================

CREATE TABLE articles (
  id UUID PRIMARY KEY REFERENCES posts(id) ON DELETE CASCADE,
  excerpt TEXT,
  content TEXT, -- Markdown o HTML
  cover_image_url VARCHAR(500),
  cover_image_alt VARCHAR(255),
  read_time VARCHAR(50) -- "5 min read"
);

-- ============================================
-- PHOTOS
-- ============================================

CREATE TABLE photos (
  id UUID PRIMARY KEY REFERENCES posts(id) ON DELETE CASCADE,
  image_url VARCHAR(500) NOT NULL,
  image_alt VARCHAR(255),
  location VARCHAR(255),
  camera VARCHAR(100),
  settings VARCHAR(255) -- "f/2.8, 1/500s, ISO 400"
);

-- ============================================
-- GALLERIES
-- ============================================

CREATE TABLE galleries (
  id UUID PRIMARY KEY REFERENCES posts(id) ON DELETE CASCADE,
  description TEXT,
  columns SMALLINT DEFAULT 2
);

CREATE TABLE gallery_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gallery_id UUID REFERENCES galleries(id) ON DELETE CASCADE,
  image_url VARCHAR(500) NOT NULL,
  image_alt VARCHAR(255),
  sort_order SMALLINT DEFAULT 0
);

CREATE INDEX idx_gallery_images_gallery ON gallery_images(gallery_id);

-- ============================================
-- THOUGHTS
-- ============================================

CREATE TABLE thoughts (
  id UUID PRIMARY KEY REFERENCES posts(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  source VARCHAR(255), -- Para quotes: "Steve Jobs"
  style thought_style DEFAULT 'note',
  mood VARCHAR(50) -- "inspired", "reflective", etc.
);

-- ============================================
-- MUSIC
-- ============================================

CREATE TABLE music (
  id UUID PRIMARY KEY REFERENCES posts(id) ON DELETE CASCADE,
  description TEXT,
  audio_url VARCHAR(500),
  audio_title VARCHAR(255) NOT NULL,
  artist VARCHAR(255) NOT NULL,
  album VARCHAR(255),
  genre VARCHAR(100),
  duration VARCHAR(20), -- "3:42"
  cover_url VARCHAR(500)
);

-- ============================================
-- PROJECTS
-- ============================================

CREATE TABLE projects (
  id UUID PRIMARY KEY REFERENCES posts(id) ON DELETE CASCADE,
  description TEXT,
  technologies TEXT[], -- Array: ['Svelte', 'TypeScript']
  status project_status DEFAULT 'in_progress',
  live_url VARCHAR(500),
  repo_url VARCHAR(500),
  cover_image_url VARCHAR(500),
  cover_image_alt VARCHAR(255)
);

-- ============================================
-- LINKS (bookmarks/shares)
-- ============================================

CREATE TABLE links (
  id UUID PRIMARY KEY REFERENCES posts(id) ON DELETE CASCADE,
  url VARCHAR(500) NOT NULL,
  description TEXT,
  site_name VARCHAR(255),
  image_url VARCHAR(500),
  image_alt VARCHAR(255)
);

-- ============================================
-- ANNOUNCEMENTS
-- ============================================

CREATE TABLE announcements (
  id UUID PRIMARY KEY REFERENCES posts(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  priority announcement_priority DEFAULT 'normal',
  cta_text VARCHAR(100),
  cta_url VARCHAR(500),
  expires_at TIMESTAMP WITH TIME ZONE
);

-- ============================================
-- VIDEOS
-- ============================================

CREATE TABLE videos (
  id UUID PRIMARY KEY REFERENCES posts(id) ON DELETE CASCADE,
  video_url VARCHAR(500),
  embed_url VARCHAR(500),
  thumbnail_url VARCHAR(500),
  duration VARCHAR(20), -- "10:32"
  provider VARCHAR(50), -- "youtube", "vimeo", etc.
  description TEXT,
  transcript TEXT
);

-- ============================================
-- EVENTS
-- ============================================

CREATE TABLE events (
  id UUID PRIMARY KEY REFERENCES posts(id) ON DELETE CASCADE,
  description TEXT,
  content TEXT,
  cover_image_url VARCHAR(500),
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  location_name VARCHAR(255),
  location_address VARCHAR(500),
  location_lat DECIMAL(10, 8),
  location_lng DECIMAL(11, 8),
  is_virtual BOOLEAN DEFAULT FALSE,
  virtual_url VARCHAR(500),
  registration_url VARCHAR(500),
  price VARCHAR(100),
  capacity INTEGER
);

-- ============================================
-- RECOMMENDATION/RATING/RANKING TYPES
-- ============================================

CREATE TYPE item_type AS ENUM (
  'serie',
  'película',
  'libro',
  'podcast',
  'otro'
);

-- ============================================
-- RECOMMENDATIONS
-- ============================================

CREATE TABLE recommendations (
  id UUID PRIMARY KEY REFERENCES posts(id) ON DELETE CASCADE,
  subject_title VARCHAR(500) NOT NULL,
  recommendation_type item_type NOT NULL,
  description TEXT,
  cover_image_url VARCHAR(500),
  cover_image_alt VARCHAR(255),
  rating DECIMAL(3,1), -- 0.0 to 10.0
  external_url VARCHAR(500),
  recommended_by_user BOOLEAN DEFAULT TRUE,
  compact BOOLEAN DEFAULT FALSE
);

CREATE INDEX idx_recommendations_type ON recommendations(recommendation_type);
CREATE INDEX idx_recommendations_rating ON recommendations(rating);

-- ============================================
-- RATINGS
-- ============================================

CREATE TABLE ratings (
  id UUID PRIMARY KEY REFERENCES posts(id) ON DELETE CASCADE,
  subject_title VARCHAR(500) NOT NULL,
  item_type item_type NOT NULL,
  cover_image_url VARCHAR(500),
  cover_image_alt VARCHAR(255),
  rating DECIMAL(3,1) NOT NULL, -- 0.0 to 10.0
  liked BOOLEAN DEFAULT FALSE,
  comment TEXT
);

CREATE INDEX idx_ratings_type ON ratings(item_type);
CREATE INDEX idx_ratings_rating ON ratings(rating);
CREATE INDEX idx_ratings_liked ON ratings(liked);

-- ============================================
-- RANKINGS
-- ============================================

CREATE TABLE rankings (
  id UUID PRIMARY KEY REFERENCES posts(id) ON DELETE CASCADE,
  description TEXT,
  cover_image_url VARCHAR(500),
  cover_image_alt VARCHAR(255)
);

-- ============================================
-- RANKING ITEMS (1:N relationship)
-- ============================================

CREATE TABLE ranking_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ranking_id UUID REFERENCES rankings(id) ON DELETE CASCADE,
  rank INTEGER NOT NULL,
  subject_title VARCHAR(500) NOT NULL,
  item_type item_type NOT NULL,
  cover_image_url VARCHAR(500),
  cover_image_alt VARCHAR(255),
  rating DECIMAL(3,1),
  description TEXT,
  external_url VARCHAR(500),
  sort_order INTEGER DEFAULT 0
);

CREATE INDEX idx_ranking_items_ranking ON ranking_items(ranking_id);
CREATE INDEX idx_ranking_items_rank ON ranking_items(rank);

-- ============================================
-- FUNCIÓN PARA ACTUALIZAR updated_at
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER posts_updated_at
  BEFORE UPDATE ON posts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- ============================================
-- VISTA PARA FEED (COMPLETA - todos los tipos)
-- ============================================
-- NOTA: Para actualizar esta vista en la BD, ejecutar:
-- DROP VIEW IF EXISTS feed_view;
-- Y luego el CREATE VIEW de abajo.

CREATE VIEW feed_view AS
SELECT
  p.id,
  p.slug,
  p.type,
  p.title,
  p.status,
  p.featured,
  p.category,
  p.tags,
  p.created_at,
  p.updated_at,
  p.published_at,
  -- Article fields
  a.excerpt,
  a.content,
  a.cover_image_url AS article_cover_url,
  a.cover_image_alt AS article_cover_alt,
  a.read_time,
  -- Photo fields
  ph.image_url AS photo_url,
  ph.image_alt AS photo_alt,
  ph.location AS photo_location,
  ph.camera AS photo_camera,
  ph.settings AS photo_settings,
  -- Gallery fields
  g.description AS gallery_description,
  g.columns AS gallery_columns,
  -- Thought fields
  t.content AS thought_content,
  t.source AS thought_source,
  t.style AS thought_style,
  t.mood AS thought_mood,
  -- Music fields
  m.audio_url,
  m.audio_title,
  m.artist,
  m.album,
  m.genre,
  m.duration,
  m.cover_url AS music_cover_url,
  m.description AS music_description,
  -- Video fields
  v.video_url,
  v.embed_url,
  v.thumbnail_url,
  v.duration AS video_duration,
  v.provider,
  v.description AS video_description,
  v.transcript,
  -- Project fields
  pr.description AS project_description,
  pr.technologies,
  pr.status AS project_status,
  pr.live_url,
  pr.repo_url,
  pr.cover_image_url AS project_cover_url,
  pr.cover_image_alt AS project_cover_alt,
  -- Link fields
  l.url AS link_url,
  l.description AS link_description,
  l.site_name,
  l.image_url AS link_image_url,
  l.image_alt AS link_image_alt,
  -- Announcement fields
  an.content AS announcement_content,
  an.priority AS announcement_priority,
  an.cta_text,
  an.cta_url,
  an.expires_at,
  -- Event fields
  e.description AS event_description,
  e.content AS event_content,
  e.cover_image_url AS event_cover_url,
  e.start_date,
  e.end_date,
  e.location_name,
  e.location_address,
  e.location_lat,
  e.location_lng,
  e.is_virtual,
  e.virtual_url,
  e.registration_url,
  e.price,
  e.capacity,
  -- Recommendation fields
  rec.subject_title AS recommendation_subject,
  rec.recommendation_type,
  rec.description AS recommendation_description,
  rec.cover_image_url AS recommendation_cover_url,
  rec.cover_image_alt AS recommendation_cover_alt,
  rec.rating AS recommendation_rating,
  rec.external_url AS recommendation_external_url,
  rec.recommended_by_user,
  rec.compact AS recommendation_compact,
  -- Rating fields
  rat.subject_title AS rating_subject,
  rat.item_type AS rating_item_type,
  rat.cover_image_url AS rating_cover_url,
  rat.cover_image_alt AS rating_cover_alt,
  rat.rating AS rating_value,
  rat.liked AS rating_liked,
  rat.comment AS rating_comment,
  -- Ranking fields
  rank.description AS ranking_description,
  rank.cover_image_url AS ranking_cover_url,
  rank.cover_image_alt AS ranking_cover_alt
FROM posts p
LEFT JOIN articles a ON p.id = a.id AND p.type = 'article'
LEFT JOIN photos ph ON p.id = ph.id AND p.type = 'photo'
LEFT JOIN galleries g ON p.id = g.id AND p.type = 'gallery'
LEFT JOIN thoughts t ON p.id = t.id AND p.type = 'thought'
LEFT JOIN music m ON p.id = m.id AND p.type = 'music'
LEFT JOIN videos v ON p.id = v.id AND p.type = 'video'
LEFT JOIN projects pr ON p.id = pr.id AND p.type = 'project'
LEFT JOIN links l ON p.id = l.id AND p.type = 'link'
LEFT JOIN announcements an ON p.id = an.id AND p.type = 'announcement'
LEFT JOIN events e ON p.id = e.id AND p.type = 'event'
LEFT JOIN recommendations rec ON p.id = rec.id AND p.type = 'recommendation'
LEFT JOIN ratings rat ON p.id = rat.id AND p.type = 'rating'
LEFT JOIN rankings rank ON p.id = rank.id AND p.type = 'ranking'
ORDER BY p.created_at DESC;

-- NOTA IMPORTANTE: Las gallery_images y ranking_items NO están en la vista porque
-- son relaciones 1:N. El API las obtiene en una consulta separada
-- y las combina con el resultado del post tipo 'gallery' o 'ranking'.

