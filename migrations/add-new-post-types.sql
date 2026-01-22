-- ============================================
-- MIGRATION: Add Recommendation, Rating, and Ranking post types
-- ============================================

-- 1. Add new types to post_type enum
ALTER TYPE post_type ADD VALUE IF NOT EXISTS 'recommendation';
ALTER TYPE post_type ADD VALUE IF NOT EXISTS 'ranking';
ALTER TYPE post_type ADD VALUE IF NOT EXISTS 'rating';

-- Note: PostgreSQL doesn't allow removing enum values easily, so we just add new ones

-- 2. Create item_type enum for consistency
CREATE TYPE item_type AS ENUM (
  'serie',
  'película',
  'libro',
  'podcast',
  'otro'
);

-- ============================================
-- RECOMMENDATIONS TABLE
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
-- RATINGS TABLE
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
-- RANKINGS TABLE
-- ============================================
CREATE TABLE rankings (
  id UUID PRIMARY KEY REFERENCES posts(id) ON DELETE CASCADE,
  description TEXT,
  cover_image_url VARCHAR(500),
  cover_image_alt VARCHAR(255)
);

-- ============================================
-- RANKING ITEMS TABLE (1:N relationship)
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
-- UPDATE FEED VIEW
-- ============================================
-- Drop and recreate the feed view with new tables
DROP VIEW IF EXISTS feed_view;

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

-- ============================================
-- GRANT PERMISSIONS (if needed)
-- ============================================
GRANT ALL PRIVILEGES ON TABLE recommendations TO blog_user;
GRANT ALL PRIVILEGES ON TABLE ratings TO blog_user;
GRANT ALL PRIVILEGES ON TABLE rankings TO blog_user;
GRANT ALL PRIVILEGES ON TABLE ranking_items TO blog_user;
