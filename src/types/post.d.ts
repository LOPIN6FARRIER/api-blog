// ============================================
// POST TYPES
// ============================================

export type PostType =
  | "article" // Artículos largos, tutoriales, blog posts
  | "photo" // Fotografías individuales o destacadas
  | "gallery" // Colección de fotos
  | "thought" // Pensamientos cortos, citas, reflexiones
  | "music" // Tracks, playlists, álbumes
  | "video" // Videos embebidos o propios
  | "project" // Proyectos de portfolio
  | "link" // Enlaces externos con preview
  | "announcement" // Anuncios importantes
  | "event" // Eventos con fecha
  | "recommendation" // Recomendaciones de series, películas, libros, etc.
  | "ranking" // Listas o rankings de ítems
  | "rating"; // Valoraciones individuales de ítems

export type PostStatus = "draft" | "published" | "archived";
export type ThoughtStyle = "quote" | "note" | "idea";
export type ThoughtMood = "reflective" | "inspired" | "curious" | "grateful";
export type ProjectStatus = "in-progress" | "completed" | "archived";
export type AnnouncementPriority = "low" | "normal" | "high" | "urgent";
export type VideoProvider = "youtube" | "vimeo" | "self";
export type GalleryLayout = "grid" | "masonry" | "carousel";

// ============================================
// BASE INTERFACES
// ============================================

export interface PostBase {
  id: string;
  slug: string;
  type: PostType;
  title: string;
  createdAt: string;
  updatedAt?: string;
  publishedAt?: string;
  draft?: boolean;
  featured?: boolean;
  author?: Author;
  tags?: string[];
  category?: string;
}

export interface Author {
  name: string;
  avatar?: string;
  href?: string;
}

// ============================================
// MEDIA INTERFACES
// ============================================

export interface ImageMedia {
  url: string;
  alt: string;
  width?: number;
  height?: number;
  caption?: string;
}

export interface AudioMedia {
  url: string;
  title: string;
  artist: string;
  album?: string;
  genre?: string;
  duration: string; // "3:42"
  coverUrl?: string;
}

export interface VideoMedia {
  url: string;
  embedUrl?: string; // YouTube, Vimeo embed
  thumbnail?: string;
  duration?: string;
  provider?: VideoProvider;
}

// ============================================
// POST TYPE INTERFACES
// ============================================

/**
 * ArticlePost - Para blogs, tutoriales, artículos largos
 */
export interface ArticlePost extends PostBase {
  type: "article";
  excerpt: string;
  content: string;
  coverImage?: ImageMedia;
  readTime?: string;
  toc?: boolean;
}

/**
 * PhotoPost - Fotografía individual destacada
 */
export interface PhotoPost extends PostBase {
  type: "photo";
  image: ImageMedia;
  description?: string;
  camera?: string;
  lens?: string;
  settings?: string;
  location?: string;
}

/**
 * GalleryPost - Colección de fotografías
 */
export interface GalleryPost extends PostBase {
  type: "gallery";
  description?: string;
  images: ImageMedia[];
  layout?: GalleryLayout;
  columns?: 2 | 3 | 4;
}

/**
 * ThoughtPost - Pensamientos cortos, citas, reflexiones
 */
export interface ThoughtPost extends PostBase {
  type: "thought";
  content: string;
  source?: string;
  mood?: ThoughtMood;
  style?: ThoughtStyle;
}

/**
 * MusicPost - Tracks, playlists, álbumes
 */
export interface MusicPost extends PostBase {
  type: "music";
  audio: AudioMedia;
  description?: string;
  lyrics?: string;
  spotifyUrl?: string;
  appleMusicUrl?: string;
  youtubeUrl?: string;
  // Album support
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

/**
 * VideoPost - Videos propios o embebidos
 */
export interface VideoPost extends PostBase {
  type: "video";
  video: VideoMedia;
  description?: string;
  transcript?: string;
}

/**
 * ProjectPost - Proyectos de portfolio
 */
export interface ProjectPost extends PostBase {
  type: "project";
  description: string;
  content?: string;
  coverImage?: ImageMedia;
  images?: ImageMedia[];
  technologies?: string[];
  liveUrl?: string;
  repoUrl?: string;
  status?: ProjectStatus;
  role?: string;
  client?: string;
  year?: number;
}

/**
 * LinkPost - Enlaces externos con preview
 */
export interface LinkPost extends PostBase {
  type: "link";
  url: string;
  description?: string;
  siteName?: string;
  favicon?: string;
  image?: ImageMedia;
}

/**
 * AnnouncementPost - Anuncios importantes
 */
export interface AnnouncementPost extends PostBase {
  type: "announcement";
  content: string;
  priority?: AnnouncementPriority;
  expiresAt?: string;
  ctaText?: string;
  ctaUrl?: string;
}

/**
 * EventPost - Eventos con fecha
 */
export interface EventPost extends PostBase {
  type: "event";
  description: string;
  content?: string;
  coverImage?: ImageMedia;
  startDate: string;
  endDate?: string;
  location?: {
    name: string;
    address?: string;
    coordinates?: { lat: number; lng: number };
    virtual?: boolean;
    url?: string;
  };
  registrationUrl?: string;
  price?: string;
  capacity?: number;
}

// ============================================
// RANKING ITEM TYPE
// ============================================

export type ItemType = "serie" | "película" | "libro" | "podcast" | "otro";

export type RankingItem = {
  rank: number;
  subjectTitle: string;
  itemType: ItemType;
  coverImage?: ImageMedia;
  rating?: number;
  description?: string;
  externalUrl?: string;
};

// ============================================
// RANKING/LIST POST (RankingPost)
// ============================================

export interface RankingPost extends PostBase {
  type: "ranking";
  title: string;
  items: RankingItem[];
  description?: string;
  coverImage?: ImageMedia;
}

// ============================================
// RATING POST (RatingPost)
// ============================================

export interface RatingPost extends PostBase {
  type: "rating";
  subjectTitle: string;
  itemType: ItemType;
  coverImage?: ImageMedia;
  rating: number;
  liked?: boolean;
  comment?: string;
}

// ============================================
// RECOMMENDATION POST (RecommendationPost)
// ============================================

export interface RecommendationPost extends PostBase {
  type: "recommendation";
  subjectTitle: string;
  recommendationType: ItemType;
  description?: string;
  coverImage?: ImageMedia;
  rating?: number;
  externalUrl?: string;
  recommendedByUser?: boolean;
  compact?: boolean;
}

// ============================================
// UNION TYPE
// ============================================

export type Post =
  | ArticlePost
  | PhotoPost
  | GalleryPost
  | ThoughtPost
  | MusicPost
  | VideoPost
  | ProjectPost
  | LinkPost
  | AnnouncementPost
  | EventPost
  | RankingPost
  | RatingPost
  | RecommendationPost;

// ============================================
// FEED ITEM (para renderizado en MasonryFeed)
// ============================================

export interface FeedItem {
  post: Post;
  size?: "small" | "medium" | "large" | "full";
  priority?: number;
}
