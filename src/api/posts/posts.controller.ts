import {
  createSuccessResult,
  createErrorResult,
  ControllerResult,
} from "../../shared/api.utils.js";
import { logger } from "../../shared/logger.utils.js";
import { query, getClient } from "../../database/connection.js";
import type {
  PostsQuery,
  UnifiedCreatePost,
  UnifiedUpdatePost,
} from "./posts.validator.js";
import type { Post, ImageMedia, PostType } from "../../types/post.js";

// ------------------ Row to Post Transformer ------------------

interface DbRow {
  id: string;
  slug: string;
  type: PostType;
  title: string;
  status: string;
  featured: boolean;
  category: string | null;
  tags: string[] | null;
  created_at: string;
  updated_at: string | null;
  published_at: string | null;
  // Article
  excerpt?: string | null;
  content?: string | null;
  article_cover_url?: string | null;
  article_cover_alt?: string | null;
  read_time?: string | null;
  // Photo
  photo_url?: string | null;
  photo_alt?: string | null;
  photo_location?: string | null;
  photo_camera?: string | null;
  photo_settings?: string | null;
  // Gallery
  gallery_description?: string | null;
  gallery_columns?: number | null;
  // Thought
  thought_content?: string | null;
  thought_source?: string | null;
  thought_style?: string | null;
  thought_mood?: string | null;
  // Music
  audio_url?: string | null;
  audio_title?: string | null;
  artist?: string | null;
  album?: string | null;
  genre?: string | null;
  duration?: string | null;
  music_cover_url?: string | null;
  music_description?: string | null;
  music_type?: string | null;
  spotify_id?: string | null;
  spotify_url?: string | null;
  apple_music_url?: string | null;
  youtube_url?: string | null;
  release_date?: string | null;
  total_tracks?: number | null;
  tracks?: any | null;
  // Video
  video_url?: string | null;
  embed_url?: string | null;
  thumbnail_url?: string | null;
  video_duration?: string | null;
  provider?: string | null;
  video_description?: string | null;
  transcript?: string | null;
  // Project
  project_description?: string | null;
  project_content?: string | null;
  technologies?: string[] | null;
  project_status?: string | null;
  live_url?: string | null;
  repo_url?: string | null;
  project_cover_url?: string | null;
  project_cover_alt?: string | null;
  // Link
  link_url?: string | null;
  link_description?: string | null;
  site_name?: string | null;
  link_image_url?: string | null;
  link_image_alt?: string | null;
  // Announcement
  announcement_content?: string | null;
  announcement_priority?: string | null;
  cta_text?: string | null;
  cta_url?: string | null;
  expires_at?: string | null;
  // Event
  event_description?: string | null;
  event_content?: string | null;
  event_cover_url?: string | null;
  start_date?: string | null;
  end_date?: string | null;
  location_name?: string | null;
  location_address?: string | null;
  location_lat?: number | null;
  location_lng?: number | null;
  is_virtual?: boolean | null;
  virtual_url?: string | null;
  registration_url?: string | null;
  price?: string | null;
  capacity?: number | null;
  // Recommendation
  recommendation_subject?: string | null;
  recommendation_type?: string | null;
  recommendation_description?: string | null;
  recommendation_cover_url?: string | null;
  recommendation_cover_alt?: string | null;
  recommendation_rating?: number | null;
  recommendation_external_url?: string | null;
  recommended_by_user?: boolean | null;
  recommendation_compact?: boolean | null;
  // Rating
  rating_subject?: string | null;
  rating_item_type?: string | null;
  rating_cover_url?: string | null;
  rating_cover_alt?: string | null;
  rating_value?: number | null;
  rating_liked?: boolean | null;
  rating_comment?: string | null;
  // Ranking
  ranking_description?: string | null;
  ranking_cover_url?: string | null;
  ranking_cover_alt?: string | null;
  // Gallery images (populated separately)
  gallery_images?: ImageMedia[];
  // Ranking items (populated separately)
  ranking_items?: any[];
}

function transformRowToPost(row: DbRow): Post {
  const base = {
    id: row.id,
    slug: row.slug,
    type: row.type,
    title: row.title,
    createdAt: row.created_at,
    updatedAt: row.updated_at ?? undefined,
    publishedAt: row.published_at ?? undefined,
    draft: row.status === "draft",
    featured: row.featured ?? false,
    tags: row.tags ?? undefined,
    category: row.category ?? undefined,
  };

  switch (row.type) {
    case "article":
      return {
        ...base,
        type: "article",
        excerpt: row.excerpt ?? "",
        content: row.content ?? "",
        coverImage: row.article_cover_url
          ? {
              url: row.article_cover_url,
              alt: row.article_cover_alt ?? "",
            }
          : undefined,
        readTime: row.read_time ?? undefined,
      };

    case "photo":
      return {
        ...base,
        type: "photo",
        image: {
          url: row.photo_url ?? "",
          alt: row.photo_alt ?? "",
        },
        camera: row.photo_camera ?? undefined,
        settings: row.photo_settings ?? undefined,
        location: row.photo_location ?? undefined,
      };

    case "gallery":
      return {
        ...base,
        type: "gallery",
        description: row.gallery_description ?? undefined,
        images: row.gallery_images ?? [],
        columns: (row.gallery_columns as 2 | 3 | 4) ?? 2,
      };

    case "thought":
      return {
        ...base,
        type: "thought",
        content: row.thought_content ?? "",
        source: row.thought_source ?? undefined,
        style: (row.thought_style as any) ?? undefined,
        mood: (row.thought_mood as any) ?? undefined,
      };

    case "music":
      return {
        ...base,
        type: "music",
        audio: {
          url: row.audio_url ?? "",
          title: row.audio_title ?? "",
          artist: row.artist ?? "",
          album: row.album ?? undefined,
          genre: row.genre ?? undefined,
          duration: row.duration ?? "",
          coverUrl: row.music_cover_url ?? undefined,
        },
        description: row.music_description ?? undefined,
        musicType: (row.music_type as "track" | "album") ?? undefined,
        spotifyId: row.spotify_id ?? undefined,
        spotifyUrl: row.spotify_url ?? undefined,
        appleMusicUrl: row.apple_music_url ?? undefined,
        youtubeUrl: row.youtube_url ?? undefined,
        releaseDate: row.release_date ?? undefined,
        totalTracks: row.total_tracks ?? undefined,
        tracks: row.tracks ?? undefined,
      };

    case "video":
      return {
        ...base,
        type: "video",
        video: {
          url: row.video_url ?? "",
          embedUrl: row.embed_url ?? undefined,
          thumbnail: row.thumbnail_url ?? undefined,
          duration: row.video_duration ?? undefined,
          provider: (row.provider as any) ?? undefined,
        },
        description: row.video_description ?? undefined,
        transcript: row.transcript ?? undefined,
      };

    case "project":
      return {
        ...base,
        type: "project",
        description: row.project_description ?? "",
        content: row.project_content ?? undefined,
        coverImage: row.project_cover_url
          ? {
              url: row.project_cover_url,
              alt: row.project_cover_alt ?? "",
            }
          : undefined,
        technologies: row.technologies ?? undefined,
        liveUrl: row.live_url ?? undefined,
        repoUrl: row.repo_url ?? undefined,
        status: (row.project_status as any) ?? undefined,
      };

    case "link":
      return {
        ...base,
        type: "link",
        url: row.link_url ?? "",
        description: row.link_description ?? undefined,
        siteName: row.site_name ?? undefined,
        image: row.link_image_url
          ? {
              url: row.link_image_url,
              alt: row.link_image_alt ?? "",
            }
          : undefined,
      };

    case "announcement":
      return {
        ...base,
        type: "announcement",
        content: row.announcement_content ?? "",
        priority: (row.announcement_priority as any) ?? undefined,
        ctaText: row.cta_text ?? undefined,
        ctaUrl: row.cta_url ?? undefined,
        expiresAt: row.expires_at ?? undefined,
      };

    case "event":
      return {
        ...base,
        type: "event",
        description: row.event_description ?? "",
        content: row.event_content ?? undefined,
        coverImage: row.event_cover_url
          ? {
              url: row.event_cover_url,
              alt: "",
            }
          : undefined,
        startDate: row.start_date ?? "",
        endDate: row.end_date ?? undefined,
        location: row.location_name
          ? {
              name: row.location_name,
              address: row.location_address ?? undefined,
              coordinates:
                row.location_lat && row.location_lng
                  ? {
                      lat: row.location_lat,
                      lng: row.location_lng,
                    }
                  : undefined,
              virtual: row.is_virtual ?? undefined,
              url: row.virtual_url ?? undefined,
            }
          : undefined,
        registrationUrl: row.registration_url ?? undefined,
        price: row.price ?? undefined,
        capacity: row.capacity ?? undefined,
      };

    case "recommendation":
      return {
        ...base,
        type: "recommendation",
        subjectTitle: row.recommendation_subject ?? "",
        recommendationType: (row.recommendation_type as any) ?? "otro",
        description: row.recommendation_description ?? undefined,
        coverImage: row.recommendation_cover_url
          ? {
              url: row.recommendation_cover_url,
              alt: row.recommendation_cover_alt ?? "",
            }
          : undefined,
        rating: row.recommendation_rating ?? undefined,
        externalUrl: row.recommendation_external_url ?? undefined,
        recommendedByUser: row.recommended_by_user ?? undefined,
        compact: row.recommendation_compact ?? undefined,
      };

    case "rating":
      return {
        ...base,
        type: "rating",
        subjectTitle: row.rating_subject ?? "",
        itemType: (row.rating_item_type as any) ?? "otro",
        coverImage: row.rating_cover_url
          ? {
              url: row.rating_cover_url,
              alt: row.rating_cover_alt ?? "",
            }
          : undefined,
        rating: row.rating_value ?? 0,
        liked: row.rating_liked ?? undefined,
        comment: row.rating_comment ?? undefined,
      };

    case "ranking":
      return {
        ...base,
        type: "ranking",
        description: row.ranking_description ?? undefined,
        items: row.ranking_items ?? [],
        coverImage: row.ranking_cover_url
          ? {
              url: row.ranking_cover_url,
              alt: row.ranking_cover_alt ?? "",
            }
          : undefined,
      };

    default:
      return base as Post;
  }
}

// ------------------ SQL Query Builder ------------------

const FULL_SELECT_SQL = `
  SELECT
    p.id, p.slug, p.type, p.title, p.status, p.featured, p.category, p.tags,
    p.created_at, p.updated_at, p.published_at,
    -- Article
    a.excerpt, a.content, a.cover_image_url AS article_cover_url,
    a.cover_image_alt AS article_cover_alt, a.read_time,
    -- Photo
    ph.image_url AS photo_url, ph.image_alt AS photo_alt,
    ph.location AS photo_location, ph.camera AS photo_camera, ph.settings AS photo_settings,
    -- Gallery
    g.description AS gallery_description, g.columns AS gallery_columns,
    -- Thought
    t.content AS thought_content, t.source AS thought_source,
    t.style AS thought_style, t.mood AS thought_mood,
    -- Music
    m.audio_url, m.audio_title, m.artist, m.album, m.genre, m.duration,
    m.cover_url AS music_cover_url, m.description AS music_description,
    m.music_type, m.spotify_id, m.spotify_url, m.apple_music_url,
    m.youtube_url, m.release_date, m.total_tracks, m.tracks,
    -- Video
    v.video_url, v.embed_url, v.thumbnail_url, v.duration AS video_duration,
    v.provider, v.description AS video_description, v.transcript,
    -- Project
    pr.description AS project_description, pr.technologies, pr.status AS project_status,
    pr.live_url, pr.repo_url, pr.cover_image_url AS project_cover_url,
    pr.cover_image_alt AS project_cover_alt,
    -- Link
    l.url AS link_url, l.description AS link_description, l.site_name,
    l.image_url AS link_image_url, l.image_alt AS link_image_alt,
    -- Announcement
    an.content AS announcement_content, an.priority AS announcement_priority,
    an.cta_text, an.cta_url, an.expires_at,
    -- Event
    e.description AS event_description, e.content AS event_content,
    e.cover_image_url AS event_cover_url,
    e.start_date, e.end_date, e.location_name, e.location_address,
    e.location_lat, e.location_lng, e.is_virtual, e.virtual_url,
    e.registration_url, e.price, e.capacity,
    -- Recommendation
    rec.subject_title AS recommendation_subject, rec.recommendation_type,
    rec.description AS recommendation_description, rec.cover_image_url AS recommendation_cover_url,
    rec.cover_image_alt AS recommendation_cover_alt, rec.rating AS recommendation_rating,
    rec.external_url AS recommendation_external_url, rec.recommended_by_user,
    rec.compact AS recommendation_compact,
    -- Rating
    rat.subject_title AS rating_subject, rat.item_type AS rating_item_type,
    rat.cover_image_url AS rating_cover_url, rat.cover_image_alt AS rating_cover_alt,
    rat.rating AS rating_value, rat.liked AS rating_liked, rat.comment AS rating_comment,
    -- Ranking
    rank.description AS ranking_description, rank.cover_image_url AS ranking_cover_url,
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
`;

function buildListQuery(q: PostsQuery, offset: number) {
  const params: unknown[] = [];
  const where = buildPostsWhere(q, params);

  let sql = FULL_SELECT_SQL;
  if (where.length) sql += " WHERE " + where.join(" AND ");
  sql += " ORDER BY p.created_at DESC";

  if (q.limit !== undefined) {
    params.push(Number(q.limit));
    sql += ` LIMIT $${params.length}`;
  }

  if (offset !== undefined) {
    params.push(offset);
    sql += ` OFFSET $${params.length}`;
  }

  return { sql, params };
}

function buildPostsWhere(q: PostsQuery, params: unknown[]) {
  const where: string[] = [];

  if (q.type) {
    const types = q.type.includes(",")
      ? q.type.split(",").map((t) => t.trim())
      : [q.type.trim()];

    params.push(types);
    where.push(`p.type::text = ANY($${params.length}::text[])`);
  }

  if (q.status) {
    params.push(q.status);
    where.push(`p.status = $${params.length}`);
  }

  if (q.featured !== undefined) {
    params.push(q.featured);
    where.push(`p.featured = $${params.length}`);
  }

  if (q.category) {
    params.push(q.category);
    where.push(`p.category = $${params.length}`);
  }

  if (q.tag) {
    params.push(q.tag);
    where.push(`p.tags @> ARRAY[$${params.length}]::text[]`);
  }

  if (q.q) {
    params.push(`%${q.q}%`);
    where.push(
      `(p.title ILIKE $${params.length} OR p.slug ILIKE $${params.length})`,
    );
  }

  return where;
}
function buildCountQuery(q: PostsQuery) {
  const params: unknown[] = [];
  const where = buildPostsWhere(q, params);

  let sql = `SELECT COUNT(*)::int AS total FROM posts p`;
  if (where.length) sql += " WHERE " + where.join(" AND ");

  return { sql, params };
}

// Fetch gallery images for a list of gallery post IDs
async function fetchGalleryImages(
  galleryIds: string[],
): Promise<Map<string, ImageMedia[]>> {
  if (galleryIds.length === 0) return new Map();

  const placeholders = galleryIds.map((_, i) => `$${i + 1}`).join(", ");
  const res = await query(
    `SELECT gallery_id, image_url, image_alt, sort_order
     FROM gallery_images
     WHERE gallery_id IN (${placeholders})
     ORDER BY sort_order ASC`,
    galleryIds,
  );

  const map = new Map<string, ImageMedia[]>();
  for (const row of res.rows) {
    const images = map.get(row.gallery_id) || [];
    images.push({
      url: row.image_url,
      alt: row.image_alt ?? "",
    });
    map.set(row.gallery_id, images);
  }
  return map;
}

// Fetch ranking items for a list of ranking post IDs
async function fetchRankingItems(
  rankingIds: string[],
): Promise<Map<string, any[]>> {
  if (rankingIds.length === 0) return new Map();

  const placeholders = rankingIds.map((_, i) => `$${i + 1}`).join(", ");
  const res = await query(
    `SELECT ranking_id, rank, subject_title, item_type, cover_image_url, cover_image_alt, rating, description, external_url, sort_order
     FROM ranking_items
     WHERE ranking_id IN (${placeholders})
     ORDER BY rank ASC, sort_order ASC`,
    rankingIds,
  );

  const map = new Map<string, any[]>();
  for (const row of res.rows) {
    const items = map.get(row.ranking_id) || [];
    items.push({
      rank: row.rank,
      subjectTitle: row.subject_title,
      itemType: row.item_type,
      coverImage: row.cover_image_url
        ? {
            url: row.cover_image_url,
            alt: row.cover_image_alt ?? "",
          }
        : undefined,
      rating: row.rating ?? undefined,
      description: row.description ?? undefined,
      externalUrl: row.external_url ?? undefined,
    });
    map.set(row.ranking_id, items);
  }
  return map;
}

// ------------------ Controllers ------------------

export async function getPosts(q: PostsQuery): Promise<ControllerResult> {
  try {
    const limit: number = Number(q.limit);
    const page: number = Number(q.page);
    const offset: number = (page - 1) * limit;
    const { sql, params } = buildListQuery(q, offset);
    const res = await query(sql, params);
    // 2. Count
    const countQuery = buildCountQuery(q);
    const countRes = await query(countQuery.sql, countQuery.params);

    const totalCount = countRes.rows[0].total as number;

    // Get gallery IDs to fetch their images
    const galleryIds = res.rows
      .filter((r: DbRow) => r.type === "gallery")
      .map((r: DbRow) => r.id);

    const galleryImagesMap = await fetchGalleryImages(galleryIds);

    // Get ranking IDs to fetch their items
    const rankingIds = res.rows
      .filter((r: DbRow) => r.type === "ranking")
      .map((r: DbRow) => r.id);

    const rankingItemsMap = await fetchRankingItems(rankingIds);

    // Transform rows to Post objects
    const posts: Post[] = res.rows.map((row: DbRow) => {
      if (row.type === "gallery") {
        row.gallery_images = galleryImagesMap.get(row.id) || [];
      }
      if (row.type === "ranking") {
        row.ranking_items = rankingItemsMap.get(row.id) || [];
      }
      return transformRowToPost(row);
    });

    const currentPage = page;
    const totalPages = Math.ceil(totalCount / limit);
    const hasMorePages = offset + limit < totalCount;

    return createSuccessResult(
      "Posts retrieved",
      posts,
      undefined,
      200,
      currentPage,
      totalPages,
      posts.length,
      totalCount,
      hasMorePages,
    );
  } catch (error) {
    logger.error({ err: error }, "Error in getPosts");
    return createErrorResult(
      "Failed to list posts",
      error instanceof Error ? error.message : String(error),
      500,
    );
  }
}

export async function getPost(idOrSlug: string): Promise<ControllerResult> {
  try {
    // Try to find by ID (if it's a UUID) or by slug
    const res = await query(
      FULL_SELECT_SQL + " WHERE (p.id::text = $1 OR p.slug = $1) LIMIT 1",
      [idOrSlug],
    );

    if ((res.rowCount ?? 0) === 0) {
      return createErrorResult("Not found", "Post not found", 404);
    }

    const row: DbRow = res.rows[0];

    // If gallery, fetch images
    if (row.type === "gallery") {
      const imagesMap = await fetchGalleryImages([row.id]);
      row.gallery_images = imagesMap.get(row.id) || [];
    }

    // If ranking, fetch items
    if (row.type === "ranking") {
      const itemsMap = await fetchRankingItems([row.id]);
      row.ranking_items = itemsMap.get(row.id) || [];
    }

    const post = transformRowToPost(row);
    return createSuccessResult("Post found", post);
  } catch (error) {
    logger.error({ err: error }, "Error in getPost");
    return createErrorResult(
      "Failed to get post",
      error instanceof Error ? error.message : String(error),
      500,
    );
  }
}

// Helper to generate unique slug
async function generateUniqueSlug(
  client: any,
  baseSlug: string,
): Promise<string> {
  // Check if base slug exists
  const check = await client.query("SELECT id FROM posts WHERE slug = $1", [
    baseSlug,
  ]);
  if (check.rowCount === 0) {
    return baseSlug;
  }

  // Find next available number
  let counter = 1;
  while (true) {
    const candidateSlug = `${baseSlug}-${counter}`;
    const exists = await client.query("SELECT id FROM posts WHERE slug = $1", [
      candidateSlug,
    ]);
    if (exists.rowCount === 0) {
      return candidateSlug;
    }
    counter++;
    if (counter > 100) {
      // Fallback: append timestamp
      return `${baseSlug}-${Date.now()}`;
    }
  }
}

export async function createPost(
  body: UnifiedCreatePost,
): Promise<ControllerResult<{ id: string }>> {
  const client = await getClient();
  try {
    await client.query("BEGIN");

    // Generate unique slug if needed
    const uniqueSlug = await generateUniqueSlug(client, body.slug);

    const insertPostText = `
      INSERT INTO posts (slug, type, title, status, featured, category, tags, published_at)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
      RETURNING id
    `;

    const tags = body.tags || null;

    const res = await client.query(insertPostText, [
      uniqueSlug,
      body.type,
      body.title,
      body.status,
      body.featured ?? false,
      body.category || null,
      tags,
      body.published_at || null,
    ]);

    const postId = res.rows[0].id;

    // Support type-specific payload inserts using the discriminated union `UnifiedCreatePost`
    const b = body;
    if (b.type === "article") {
      await client.query(
        `INSERT INTO articles (id, excerpt, content, cover_image_url, cover_image_alt, read_time) VALUES ($1,$2,$3,$4,$5,$6)`,
        [
          postId,
          b.excerpt || null,
          b.content || null,
          b.cover_image_url || null,
          b.cover_image_alt || null,
          b.read_time || null,
        ],
      );
    } else if (b.type === "photo") {
      await client.query(
        `INSERT INTO photos (id, image_url, image_alt, location, camera, settings) VALUES ($1,$2,$3,$4,$5,$6)`,
        [
          postId,
          b.image_url || null,
          b.image_alt || null,
          b.location || null,
          b.camera || null,
          b.settings || null,
        ],
      );
    } else if (b.type === "gallery") {
      await client.query(
        `INSERT INTO galleries (id, description, columns) VALUES ($1,$2,$3)`,
        [postId, b.description || null, b.columns ?? 2],
      );
      if (Array.isArray(b.images)) {
        for (let i = 0; i < b.images.length; i++) {
          const it = b.images[i];
          await client.query(
            `INSERT INTO gallery_images (gallery_id, image_url, image_alt, sort_order) VALUES ($1,$2,$3,$4)`,
            [postId, it.image_url, it.image_alt || null, it.sort_order ?? i],
          );
        }
      }
    } else if (b.type === "thought") {
      await client.query(
        `INSERT INTO thoughts (id, content, source, style, mood) VALUES ($1,$2,$3,$4,$5)`,
        [
          postId,
          b.content || null,
          b.source || null,
          b.style || null,
          b.mood || null,
        ],
      );
    } else if (b.type === "music") {
      // Extract values, supporting both camelCase and snake_case
      const audioUrl = b.audio_url || b.audio?.url || null;
      const audioTitle = b.audio_title || b.audio?.title || null;
      const artist = b.artist || b.audio?.artist || null;
      const album = b.album || b.audio?.album || null;
      const genre = b.genre || b.audio?.genre || null;
      const duration = b.duration || b.audio?.duration || null;
      const coverUrl = b.cover_url || b.audio?.coverUrl || null;
      const musicType = b.music_type || b.musicType || null;
      const spotifyId = b.spotify_id || b.spotifyId || null;
      const spotifyUrl = b.spotify_url || b.spotifyUrl || null;
      const appleMusicUrl = b.apple_music_url || b.appleMusicUrl || null;
      const youtubeUrl = b.youtube_url || b.youtubeUrl || null;
      const releaseDate = b.release_date || b.releaseDate || null;
      const totalTracks = b.total_tracks || b.totalTracks || null;
      const tracks = b.tracks ? JSON.stringify(b.tracks) : null;

      await client.query(
        `INSERT INTO music (id, description, audio_url, audio_title, artist, album, genre, duration, cover_url, music_type, spotify_id, spotify_url, apple_music_url, youtube_url, release_date, total_tracks, tracks) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17)`,
        [
          postId,
          b.description || null,
          audioUrl,
          audioTitle,
          artist,
          album,
          genre,
          duration,
          coverUrl,
          musicType,
          spotifyId,
          spotifyUrl,
          appleMusicUrl,
          youtubeUrl,
          releaseDate,
          totalTracks,
          tracks,
        ],
      );
    } else if (b.type === "video") {
      await client.query(
        `INSERT INTO videos (id, video_url, embed_url, thumbnail_url, duration, provider, description, transcript) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
        [
          postId,
          b.video_url || null,
          b.embed_url || null,
          b.thumbnail_url || null,
          b.duration || null,
          b.provider || null,
          b.description || null,
          b.transcript || null,
        ],
      );
    } else if (b.type === "project") {
      await client.query(
        `INSERT INTO projects (id, description, technologies, status, live_url, repo_url, cover_image_url, cover_image_alt) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
        [
          postId,
          b.description || null,
          b.technologies || null,
          b.project_status || null,
          b.live_url || null,
          b.repo_url || null,
          b.cover_image_url || null,
          b.cover_image_alt || null,
        ],
      );
    } else if (b.type === "link") {
      await client.query(
        `INSERT INTO links (id, url, description, site_name, image_url, image_alt) VALUES ($1,$2,$3,$4,$5,$6)`,
        [
          postId,
          b.url || null,
          b.description || null,
          b.site_name || null,
          b.image_url || null,
          b.description || null,
        ],
      );
    } else if (b.type === "announcement") {
      await client.query(
        `INSERT INTO announcements (id, content, priority, cta_text, cta_url, expires_at) VALUES ($1,$2,$3,$4,$5,$6)`,
        [
          postId,
          b.content || null,
          b.priority || null,
          b.cta_text || null,
          b.cta_url || null,
          b.expires_at || null,
        ],
      );
    } else if (b.type === "event") {
      await client.query(
        `INSERT INTO events (id, description, content, cover_image_url, start_date, end_date, location_name, location_address, location_lat, location_lng, is_virtual, virtual_url, registration_url, price, capacity) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)`,
        [
          postId,
          b.description || null,
          b.content || null,
          b.cover_image_url || null,
          b.start_date || null,
          b.end_date || null,
          b.location_name || null,
          b.location_address || null,
          b.location_lat || null,
          b.location_lng || null,
          b.is_virtual ?? false,
          b.virtual_url || null,
          b.registration_url || null,
          b.price || null,
          b.capacity || null,
        ],
      );
    } else if (b.type === "recommendation") {
      await client.query(
        `INSERT INTO recommendations (id, subject_title, recommendation_type, description, cover_image_url, cover_image_alt, rating, external_url, recommended_by_user, compact) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
        [
          postId,
          b.subject_title || null,
          b.recommendation_type || null,
          b.description || null,
          b.cover_image_url || null,
          b.cover_image_alt || null,
          b.rating || null,
          b.external_url || null,
          b.recommended_by_user ?? true,
          b.compact ?? false,
        ],
      );
    } else if (b.type === "rating") {
      await client.query(
        `INSERT INTO ratings (id, subject_title, item_type, cover_image_url, cover_image_alt, rating, liked, comment) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
        [
          postId,
          b.subject_title || null,
          b.item_type || null,
          b.cover_image_url || null,
          b.cover_image_alt || null,
          b.rating || 0,
          b.liked ?? false,
          b.comment || null,
        ],
      );
    } else if (b.type === "ranking") {
      await client.query(
        `INSERT INTO rankings (id, description, cover_image_url, cover_image_alt) VALUES ($1,$2,$3,$4)`,
        [
          postId,
          b.description || null,
          b.cover_image_url || null,
          b.cover_image_alt || null,
        ],
      );
      // Insert ranking items
      if (Array.isArray(b.items)) {
        for (let i = 0; i < b.items.length; i++) {
          const item = b.items[i];
          await client.query(
            `INSERT INTO ranking_items (ranking_id, rank, subject_title, item_type, cover_image_url, cover_image_alt, rating, description, external_url, sort_order) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
            [
              postId,
              item.rank,
              item.subject_title,
              item.item_type,
              item.cover_image_url || null,
              item.cover_image_alt || null,
              item.rating || null,
              item.description || null,
              item.external_url || null,
              item.sort_order ?? i,
            ],
          );
        }
      }
    }

    await client.query("COMMIT");
    return createSuccessResult("Post created", { id: postId }, undefined, 201);
  } catch (error) {
    await client.query("ROLLBACK");
    logger.error({ err: error }, "Error in createPost");
    return createErrorResult(
      "Failed to create post",
      error instanceof Error ? error.message : String(error),
      500,
    );
  } finally {
    client.release();
  }
}

export async function updatePost(
  id: string,
  body: UnifiedUpdatePost,
): Promise<ControllerResult> {
  const client = await getClient();
  try {
    await client.query("BEGIN");

    // Primero obtener el tipo actual del post
    const postRes = await client.query("SELECT type FROM posts WHERE id = $1", [
      id,
    ]);
    if (postRes.rowCount === 0) {
      await client.query("ROLLBACK");
      return createErrorResult("Not found", "Post not found", 404);
    }
    const currentType = postRes.rows[0].type;
    const b = body;

    // Actualizar campos base de posts
    const fields: string[] = [];
    const params: any[] = [];
    let idx = 1;

    const setIf = (val: any, column: string) => {
      if (val !== undefined) {
        params.push(val);
        fields.push(`${column} = $${idx++}`);
      }
    };

    setIf(b.slug, "slug");
    setIf(b.title, "title");
    setIf(b.status, "status");
    if (b.featured !== undefined) setIf(b.featured, "featured");
    setIf(b.category, "category");
    if (b.tags !== undefined) setIf(b.tags, "tags");
    setIf(b.published_at, "published_at");

    if (fields.length) {
      params.push(id);
      await client.query(
        `UPDATE posts SET ${fields.join(", ")} WHERE id = $${idx}`,
        params,
      );
    }

    // Actualizar tabla específica según el tipo
    if (currentType === "article") {
      await client.query(
        `UPDATE articles SET excerpt = COALESCE($1, excerpt), content = COALESCE($2, content), cover_image_url = COALESCE($3, cover_image_url), cover_image_alt = COALESCE($4, cover_image_alt), read_time = COALESCE($5, read_time) WHERE id = $6`,
        [
          b.excerpt,
          b.content,
          b.cover_image_url,
          b.cover_image_alt,
          b.read_time,
          id,
        ],
      );
    } else if (currentType === "photo") {
      await client.query(
        `UPDATE photos SET image_url = COALESCE($1, image_url), image_alt = COALESCE($2, image_alt), location = COALESCE($3, location), camera = COALESCE($4, camera), settings = COALESCE($5, settings) WHERE id = $6`,
        [b.image_url, b.image_alt, b.location, b.camera, b.settings, id],
      );
    } else if (currentType === "gallery") {
      await client.query(
        `UPDATE galleries SET description = COALESCE($1, description), columns = COALESCE($2, columns) WHERE id = $3`,
        [b.description, b.columns, id],
      );
      // Si se envían nuevas imágenes, reemplazar las existentes
      if (Array.isArray(b.images)) {
        await client.query(`DELETE FROM gallery_images WHERE gallery_id = $1`, [
          id,
        ]);
        for (let i = 0; i < b.images.length; i++) {
          const it = b.images[i];
          await client.query(
            `INSERT INTO gallery_images (gallery_id, image_url, image_alt, sort_order) VALUES ($1,$2,$3,$4)`,
            [id, it.image_url, it.image_alt || null, it.sort_order ?? i],
          );
        }
      }
    } else if (currentType === "thought") {
      await client.query(
        `UPDATE thoughts SET content = COALESCE($1, content), source = COALESCE($2, source), style = COALESCE($3, style), mood = COALESCE($4, mood) WHERE id = $5`,
        [b.content, b.source, b.style, b.mood, id],
      );
    } else if (currentType === "music") {
      const audioTitle = b.audio?.title || b.audio_title;
      const artist = b.audio?.artist || b.artist;
      await client.query(
        `UPDATE music SET 
          description = COALESCE($1, description), 
          audio_url = COALESCE($2, audio_url), 
          audio_title = COALESCE($3, audio_title), 
          artist = COALESCE($4, artist), 
          album = COALESCE($5, album), 
          genre = COALESCE($6, genre), 
          duration = COALESCE($7, duration), 
          cover_url = COALESCE($8, cover_url),
          music_type = COALESCE($9, music_type),
          spotify_id = COALESCE($10, spotify_id),
          spotify_url = COALESCE($11, spotify_url),
          apple_music_url = COALESCE($12, apple_music_url),
          youtube_url = COALESCE($13, youtube_url),
          release_date = COALESCE($14, release_date),
          total_tracks = COALESCE($15, total_tracks),
          tracks = COALESCE($16, tracks)
        WHERE id = $17`,
        [
          b.description,
          b.audio?.url || b.audio_url,
          audioTitle,
          artist,
          b.audio?.album || b.album,
          b.audio?.genre || b.genre,
          b.audio?.duration || b.duration,
          b.audio?.coverUrl || b.cover_url,
          b.musicType,
          b.spotifyId,
          b.spotifyUrl,
          b.appleMusicUrl,
          b.youtubeUrl,
          b.releaseDate,
          b.totalTracks,
          b.tracks ? JSON.stringify(b.tracks) : null,
          id,
        ],
      );
    } else if (currentType === "video") {
      await client.query(
        `UPDATE videos SET video_url = COALESCE($1, video_url), embed_url = COALESCE($2, embed_url), thumbnail_url = COALESCE($3, thumbnail_url), duration = COALESCE($4, duration), provider = COALESCE($5, provider), description = COALESCE($6, description), transcript = COALESCE($7, transcript) WHERE id = $8`,
        [
          b.video_url,
          b.embed_url,
          b.thumbnail_url,
          b.duration,
          b.provider,
          b.description,
          b.transcript,
          id,
        ],
      );
    } else if (currentType === "project") {
      await client.query(
        `UPDATE projects SET description = COALESCE($1, description), technologies = COALESCE($2, technologies), status = COALESCE($3, status), live_url = COALESCE($4, live_url), repo_url = COALESCE($5, repo_url), cover_image_url = COALESCE($6, cover_image_url), cover_image_alt = COALESCE($7, cover_image_alt) WHERE id = $8`,
        [
          b.description,
          b.technologies,
          b.status,
          b.live_url,
          b.repo_url,
          b.cover_image_url,
          b.cover_image_alt,
          id,
        ],
      );
    } else if (currentType === "link") {
      await client.query(
        `UPDATE links SET url = COALESCE($1, url), description = COALESCE($2, description), site_name = COALESCE($3, site_name), image_url = COALESCE($4, image_url), image_alt = COALESCE($5, image_alt) WHERE id = $6`,
        [b.url, b.description, b.site_name, b.image_url, b.image_alt, id],
      );
    } else if (currentType === "announcement") {
      await client.query(
        `UPDATE announcements SET content = COALESCE($1, content), priority = COALESCE($2, priority), cta_text = COALESCE($3, cta_text), cta_url = COALESCE($4, cta_url), expires_at = COALESCE($5, expires_at) WHERE id = $6`,
        [b.content, b.priority, b.cta_text, b.cta_url, b.expires_at, id],
      );
    } else if (currentType === "event") {
      await client.query(
        `UPDATE events SET description = COALESCE($1, description), content = COALESCE($2, content), cover_image_url = COALESCE($3, cover_image_url), start_date = COALESCE($4, start_date), end_date = COALESCE($5, end_date), location_name = COALESCE($6, location_name), location_address = COALESCE($7, location_address), location_lat = COALESCE($8, location_lat), location_lng = COALESCE($9, location_lng), is_virtual = COALESCE($10, is_virtual), virtual_url = COALESCE($11, virtual_url), registration_url = COALESCE($12, registration_url), price = COALESCE($13, price), capacity = COALESCE($14, capacity) WHERE id = $15`,
        [
          b.description,
          b.content,
          b.cover_image_url,
          b.start_date,
          b.end_date,
          b.location_name,
          b.location_address,
          b.location_lat,
          b.location_lng,
          b.is_virtual,
          b.virtual_url,
          b.registration_url,
          b.price,
          b.capacity,
          id,
        ],
      );
    } else if (currentType === "recommendation") {
      await client.query(
        `UPDATE recommendations SET subject_title = COALESCE($1, subject_title), recommendation_type = COALESCE($2, recommendation_type), description = COALESCE($3, description), cover_image_url = COALESCE($4, cover_image_url), cover_image_alt = COALESCE($5, cover_image_alt), rating = COALESCE($6, rating), external_url = COALESCE($7, external_url), recommended_by_user = COALESCE($8, recommended_by_user), compact = COALESCE($9, compact) WHERE id = $10`,
        [
          b.subject_title,
          b.recommendation_type,
          b.description,
          b.cover_image_url,
          b.cover_image_alt,
          b.rating,
          b.external_url,
          b.recommended_by_user,
          b.compact,
          id,
        ],
      );
    } else if (currentType === "rating") {
      await client.query(
        `UPDATE ratings SET subject_title = COALESCE($1, subject_title), item_type = COALESCE($2, item_type), cover_image_url = COALESCE($3, cover_image_url), cover_image_alt = COALESCE($4, cover_image_alt), rating = COALESCE($5, rating), liked = COALESCE($6, liked), comment = COALESCE($7, comment) WHERE id = $8`,
        [
          b.subject_title,
          b.item_type,
          b.cover_image_url,
          b.cover_image_alt,
          b.rating,
          b.liked,
          b.comment,
          id,
        ],
      );
    } else if (currentType === "ranking") {
      await client.query(
        `UPDATE rankings SET description = COALESCE($1, description), cover_image_url = COALESCE($2, cover_image_url), cover_image_alt = COALESCE($3, cover_image_alt) WHERE id = $4`,
        [b.description, b.cover_image_url, b.cover_image_alt, id],
      );
      // Si se envían nuevos items, reemplazar los existentes
      if (Array.isArray(b.items)) {
        await client.query(`DELETE FROM ranking_items WHERE ranking_id = $1`, [
          id,
        ]);
        for (let i = 0; i < b.items.length; i++) {
          const item = b.items[i];
          await client.query(
            `INSERT INTO ranking_items (ranking_id, rank, subject_title, item_type, cover_image_url, cover_image_alt, rating, description, external_url, sort_order) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
            [
              id,
              item.rank,
              item.subject_title,
              item.item_type,
              item.cover_image_url || null,
              item.cover_image_alt || null,
              item.rating || null,
              item.description || null,
              item.external_url || null,
              item.sort_order ?? i,
            ],
          );
        }
      }
    }

    await client.query("COMMIT");
    return createSuccessResult("Post updated", { id });
  } catch (error) {
    await client.query("ROLLBACK");
    logger.error({ err: error }, "Error in updatePost");
    return createErrorResult(
      "Failed to update post",
      error instanceof Error ? error.message : String(error),
      500,
    );
  } finally {
    client.release();
  }
}

export async function deletePost(id: string): Promise<ControllerResult> {
  try {
    const res = await query("DELETE FROM posts WHERE id = $1 RETURNING id", [
      id,
    ]);
    if (res.rowCount === 0)
      return createErrorResult("Not found", "Post not found", 404);
    return createSuccessResult("Post deleted", { id });
  } catch (error) {
    logger.error({ err: error }, "Error in deletePost");
    return createErrorResult(
      "Failed to delete post",
      error instanceof Error ? error.message : String(error),
      500,
    );
  }
}

// Attach uploaded image to a post record (updates the appropriate table based on post type)
export async function attachImageToPost(data: {
  id: string;
  filename: string;
  publicUrl: string;
  filepath: string;
}): Promise<ControllerResult> {
  const { id, publicUrl } = data;
  try {
    const res = await query("SELECT id, type FROM posts WHERE id = $1", [id]);
    if (res.rowCount === 0)
      return createErrorResult("Not found", "Post not found", 404);

    const type = res.rows[0].type;

    if (type === "photo") {
      const upd = await query(
        "UPDATE photos SET image_url = $1 WHERE id = $2 RETURNING id",
        [publicUrl, id],
      );
      if (upd.rowCount === 0) {
        await query("INSERT INTO photos (id, image_url) VALUES ($1,$2)", [
          id,
          publicUrl,
        ]);
      }
      return createSuccessResult("Image attached to photo post", {
        id,
        url: publicUrl,
      });
    }

    if (type === "article") {
      const upd = await query(
        "UPDATE articles SET cover_image_url = $1 WHERE id = $2 RETURNING id",
        [publicUrl, id],
      );
      if (upd.rowCount === 0) {
        await query(
          "INSERT INTO articles (id, cover_image_url) VALUES ($1,$2)",
          [id, publicUrl],
        );
      }
      return createSuccessResult("Image attached to article", {
        id,
        url: publicUrl,
      });
    }

    if (type === "music") {
      const upd = await query(
        "UPDATE music SET cover_url = $1 WHERE id = $2 RETURNING id",
        [publicUrl, id],
      );
      if (upd.rowCount === 0) {
        await query("INSERT INTO music (id, cover_url) VALUES ($1,$2)", [
          id,
          publicUrl,
        ]);
      }
      return createSuccessResult("Cover attached to music post", {
        id,
        url: publicUrl,
      });
    }

    if (type === "video") {
      const upd = await query(
        "UPDATE videos SET thumbnail_url = $1 WHERE id = $2 RETURNING id",
        [publicUrl, id],
      );
      if (upd.rowCount === 0) {
        await query("INSERT INTO videos (id, thumbnail_url) VALUES ($1,$2)", [
          id,
          publicUrl,
        ]);
      }
      return createSuccessResult("Thumbnail attached to video post", {
        id,
        url: publicUrl,
      });
    }

    if (type === "project") {
      const upd = await query(
        "UPDATE projects SET cover_image_url = $1 WHERE id = $2 RETURNING id",
        [publicUrl, id],
      );
      if (upd.rowCount === 0) {
        await query(
          "INSERT INTO projects (id, cover_image_url) VALUES ($1,$2)",
          [id, publicUrl],
        );
      }
      return createSuccessResult("Cover attached to project", {
        id,
        url: publicUrl,
      });
    }

    if (type === "event") {
      const upd = await query(
        "UPDATE events SET cover_image_url = $1 WHERE id = $2 RETURNING id",
        [publicUrl, id],
      );
      if (upd.rowCount === 0) {
        await query("INSERT INTO events (id, cover_image_url) VALUES ($1,$2)", [
          id,
          publicUrl,
        ]);
      }
      return createSuccessResult("Cover attached to event", {
        id,
        url: publicUrl,
      });
    }

    if (type === "recommendation") {
      const upd = await query(
        "UPDATE recommendations SET cover_image_url = $1 WHERE id = $2 RETURNING id",
        [publicUrl, id],
      );
      if (upd.rowCount === 0) {
        await query(
          "INSERT INTO recommendations (id, cover_image_url) VALUES ($1,$2)",
          [id, publicUrl],
        );
      }
      return createSuccessResult("Cover attached to recommendation", {
        id,
        url: publicUrl,
      });
    }

    if (type === "rating") {
      const upd = await query(
        "UPDATE ratings SET cover_image_url = $1 WHERE id = $2 RETURNING id",
        [publicUrl, id],
      );
      if (upd.rowCount === 0) {
        await query(
          "INSERT INTO ratings (id, cover_image_url) VALUES ($1,$2)",
          [id, publicUrl],
        );
      }
      return createSuccessResult("Cover attached to rating", {
        id,
        url: publicUrl,
      });
    }

    if (type === "ranking") {
      const upd = await query(
        "UPDATE rankings SET cover_image_url = $1 WHERE id = $2 RETURNING id",
        [publicUrl, id],
      );
      if (upd.rowCount === 0) {
        await query(
          "INSERT INTO rankings (id, cover_image_url) VALUES ($1,$2)",
          [id, publicUrl],
        );
      }
      return createSuccessResult("Cover attached to ranking", {
        id,
        url: publicUrl,
      });
    }

    if (type === "gallery") {
      // Ensure gallery row exists
      await query(
        "INSERT INTO galleries (id) VALUES ($1) ON CONFLICT (id) DO NOTHING",
        [id],
      );
      // Get next sort_order
      const sortRes = await query(
        "SELECT COALESCE(MAX(sort_order), -1) + 1 as next_order FROM gallery_images WHERE gallery_id = $1",
        [id],
      );
      const nextOrder = sortRes.rows[0]?.next_order ?? 0;
      // Insert the image
      const insertRes = await query(
        "INSERT INTO gallery_images (gallery_id, image_url, sort_order) VALUES ($1, $2, $3) RETURNING id",
        [id, publicUrl, nextOrder],
      );
      return createSuccessResult("Image added to gallery", {
        id,
        url: publicUrl,
        imageId: insertRes.rows[0]?.id,
      });
    }

    // For other types, just return the public URL (client can store where appropriate)
    return createSuccessResult("Image uploaded", { id, url: publicUrl });
  } catch (error) {
    logger.error({ err: error }, "Error in attachImageToPost");
    return createErrorResult(
      "Failed to attach image",
      error instanceof Error ? error.message : String(error),
      500,
    );
  }
}

// Attach multiple uploaded images to a post (gallery_images insertion)
export async function attachImagesToPost(data: {
  id: string;
  items: Array<{
    filename: string;
    filepath: string;
    publicUrl: string;
    meta?: any;
  }>;
}): Promise<ControllerResult> {
  const client = await getClient();
  const { id, items } = data;
  const inserted: Array<any> = [];
  try {
    await client.query("BEGIN");

    // Verify post exists
    const p = await client.query("SELECT id, type FROM posts WHERE id = $1", [
      id,
    ]);
    if (p.rowCount === 0) {
      await client.query("ROLLBACK");
      return createErrorResult("Not found", "Post not found", 404);
    }

    const postType = p.rows[0].type;

    // Ensure gallery row exists when type is 'gallery'
    if (postType === "gallery") {
      await client.query(
        "INSERT INTO galleries (id) VALUES ($1) ON CONFLICT (id) DO NOTHING",
        [id],
      );
    }

    // Insert each image into gallery_images (if gallery) or into photos (if photo)
    for (let i = 0; i < items.length; i++) {
      const it = items[i];
      const sort = it.meta?.sort_order ?? i;
      const alt = it.meta?.image_alt ?? null;

      if (postType === "gallery") {
        const res = await client.query(
          `INSERT INTO gallery_images (gallery_id, image_url, image_alt, sort_order) VALUES ($1,$2,$3,$4) RETURNING id, image_url, image_alt, sort_order`,
          [id, it.publicUrl, alt, sort],
        );
        inserted.push(res.rows[0]);
      } else if (postType === "photo") {
        // update photos table (single row) or insert if missing; for multiple images we'll insert additional gallery_images too
        const upd = await client.query(
          "UPDATE photos SET image_url = $1, image_alt = $2 WHERE id = $3 RETURNING id",
          [it.publicUrl, alt, id],
        );
        if (upd.rowCount === 0) {
          await client.query(
            "INSERT INTO photos (id, image_url, image_alt) VALUES ($1,$2,$3)",
            [id, it.publicUrl, alt],
          );
        }
        inserted.push({ url: it.publicUrl, alt });
      } else if (postType === "article") {
        // set cover image if none
        const upd = await client.query(
          "UPDATE articles SET cover_image_url = $1, cover_image_alt = $2 WHERE id = $3 RETURNING id",
          [it.publicUrl, alt, id],
        );
        if (upd.rowCount === 0) {
          await client.query(
            "INSERT INTO articles (id, cover_image_url, cover_image_alt) VALUES ($1,$2,$3)",
            [id, it.publicUrl, alt],
          );
        }
        inserted.push({ url: it.publicUrl, alt });
      } else {
        // For other types, do nothing DB-wise, just return urls
        inserted.push({ url: it.publicUrl, alt });
      }
    }

    await client.query("COMMIT");
    return createSuccessResult("Images attached", { id, inserted });
  } catch (error) {
    await client.query("ROLLBACK");
    // attempt to delete files written to disk for cleanup
    try {
      for (const it of items) {
        try {
          await import("fs").then((fs) => fs.unlinkSync(it.filepath));
        } catch (_) {}
      }
    } catch (_) {}
    logger.error({ err: error }, "Error in attachImagesToPost");
    return createErrorResult(
      "Failed to attach images",
      error instanceof Error ? error.message : String(error),
      500,
    );
  } finally {
    client.release();
  }
}

// Create music post from Spotify URL
export async function createMusicPostFromSpotify(data: {
  url: string;
  title?: string;
  tags?: string[];
  category?: string;
  status?: "draft" | "published";
  market?: string;
}): Promise<ControllerResult> {
  const vinicioDataUrl =
    process.env.VINICIO_DATA_URL || "http://localhost:8888";

  try {
    // Call Vinicio_Data to parse Spotify URL
    const response = await fetch(
      `${vinicioDataUrl}/api/spotify/parse-music-post`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url: data.url,
          market: data.market || "MX",
        }),
      },
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return createErrorResult(
        "Failed to parse Spotify URL",
        errorData.error || "Invalid Spotify URL or service unavailable",
        response.status,
      );
    }

    const musicData = await response.json();

    // Create post with the parsed data
    const createData = {
      type: "music",
      title: data.title || musicData.audio.title,
      slug:
        data.title?.toLowerCase().replace(/\s+/g, "-") ||
        musicData.audio.title.toLowerCase().replace(/\s+/g, "-"),
      status: data.status || "published",
      tags: data.tags || [],
      category: data.category,
      featured: false,
      published_at:
        (data.status || "published") === "published"
          ? new Date().toISOString()
          : undefined,
      // Music specific fields
      audio_url: musicData.audio.url || undefined,
      audio_title: musicData.audio.title || undefined,
      artist: musicData.audio.artist || undefined,
      album: musicData.audio.album || undefined,
      genre: musicData.audio.genre || undefined,
      duration: musicData.audio.duration || undefined,
      cover_url: musicData.audio.coverUrl || undefined,
      description: musicData.description || undefined,
      music_type: musicData.musicType || undefined,
      spotify_id: musicData.spotifyId || undefined,
      spotify_url: musicData.spotifyUrl || undefined,
      apple_music_url: musicData.appleMusicUrl || undefined,
      youtube_url: musicData.youtubeUrl || undefined,
      release_date: musicData.releaseDate || undefined,
      total_tracks: musicData.totalTracks || undefined,
      tracks: musicData.tracks || undefined,
    } as UnifiedCreatePost;

    return await createPost(createData);
  } catch (error) {
    logger.error({ err: error }, "Error in createMusicPostFromSpotify");
    return createErrorResult(
      "Failed to create music post from Spotify",
      error instanceof Error ? error.message : String(error),
      500,
    );
  }
}
