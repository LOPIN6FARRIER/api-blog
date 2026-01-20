import { k, kataxInfer } from 'katax-core';
import type { ValidationResult } from '../../shared/api.utils.js';

// ------------------ Schemas ------------------
export const postsQuerySchema = k.object({
  type: k.string().optional(),
  status: k.string().optional(),
  featured: k.boolean().optional(),
  category: k.string().optional(),
  tag: k.string().optional(),
  limit: k.string().regex(/^[0-9]+$/).optional(),
  offset: k.string().regex(/^[0-9]+$/).optional(),
  q: k.string().optional()
});

export type PostsQuery = kataxInfer<typeof postsQuerySchema>;

export const basePostSchema = k.object({
  slug: k.string().minLength(3),
  type: k.string().minLength(3),
  title: k.string().minLength(1),
  status: k.string().optional(),
  featured: k.boolean().optional(),
  category: k.string().optional(),
  tags: k.array(k.string()).optional(),
  published_at: k.string().optional()
});

// Optional type-specific payload (partial support)
export const articlePayloadSchema = k.object({
  excerpt: k.string().optional(),
  content: k.string().optional(),
  cover_image_url: k.string().optional(),
  cover_image_alt: k.string().optional(),
  read_time: k.string().optional()
}).optional();

export const createPostSchema = k.object({
  slug: k.string().minLength(3),
  type: k.string().minLength(3),
  title: k.string().minLength(1),
  status: k.string().optional(),
  featured: k.boolean().optional(),
  category: k.string().optional(),
  tags: k.array(k.string()).optional(),
  published_at: k.string().optional(),
  article: articlePayloadSchema
});

export type CreatePostBody = kataxInfer<typeof createPostSchema>;

export const updatePostSchema = createPostSchema.partial();
export type UpdatePostBody = kataxInfer<typeof updatePostSchema>;

// ------------------ Type-specific schemas (use new katax-core features)
// Build each type schema by extending the base schema so all share base fields
const articleSchema = basePostSchema.extend({
  type: k.literal('article'),
  excerpt: k.string().optional(),
  content: k.string().optional(),
  cover_image_url: k.string().optional(),
  cover_image_alt: k.string().optional(),
  read_time: k.string().optional(),
  image_urls: k.array(k.string()).optional()
});

const photoSchema = basePostSchema.extend({
  type: k.literal('photo'),
  image_url: k.string().optional(),
  image_alt: k.string().optional(),
  camera: k.string().optional(),
  settings: k.string().optional(),
  location: k.string().optional()
});

const galleryImageSchema = k.object({
  image_url: k.string(),
  image_alt: k.string().optional(),
  sort_order: k.number().optional()
});

const gallerySchema = basePostSchema.extend({
  type: k.literal('gallery'),
  description: k.string().optional(),
  images: k.array(galleryImageSchema).optional(),
  columns: k.number().optional()
});

const thoughtSchema = basePostSchema.extend({
  type: k.literal('thought'),
  content: k.string().optional(),
  source: k.string().optional(),
  style: k.string().optional(),
  mood: k.string().optional()
});

const musicSchema = basePostSchema.extend({
  type: k.literal('music'),
  audio: k.object({ url: k.string(), title: k.string(), artist: k.string(), album: k.string().optional(), genre: k.string().optional(), duration: k.string(), coverUrl: k.string().optional() }).optional(),
  description: k.string().optional(),
  lyrics: k.string().optional(),
  spotifyUrl: k.string().optional(),
  appleMusicUrl: k.string().optional(),
  youtubeUrl: k.string().optional()
});

const projectSchema = basePostSchema.extend({
  type: k.literal('project'),
  description: k.string().optional(),
  cover_image_url: k.string().optional(),
  cover_image_alt: k.string().optional(),
  technologies: k.array(k.string()).optional(),
  live_url: k.string().optional(),
  repo_url: k.string().optional()
});

const linkSchema = basePostSchema.extend({
  type: k.literal('link'),
  url: k.string().optional(),
  description: k.string().optional(),
  site_name: k.string().optional(),
  favicon: k.string().optional(),
  image_url: k.string().optional()
});

const announcementSchema = basePostSchema.extend({
  type: k.literal('announcement'),
  content: k.string().optional(),
  priority: k.string().optional(),
  cta_text: k.string().optional(),
  cta_url: k.string().optional(),
  expires_at: k.string().optional()
});

const videoSchema = basePostSchema.extend({
  type: k.literal('video'),
  video_url: k.string().optional(),
  embed_url: k.string().optional(),
  thumbnail_url: k.string().optional(),
  duration: k.string().optional(),
  provider: k.string().optional(),
  description: k.string().optional(),
  transcript: k.string().optional()
});

const eventSchema = basePostSchema.extend({
  type: k.literal('event'),
  description: k.string().optional(),
  content: k.string().optional(),
  cover_image_url: k.string().optional(),
  start_date: k.string().optional(),
  end_date: k.string().optional(),
  location_name: k.string().optional(),
  location_address: k.string().optional(),
  location_lat: k.number().optional(),
  location_lng: k.number().optional(),
  is_virtual: k.boolean().optional(),
  virtual_url: k.string().optional(),
  registration_url: k.string().optional(),
  price: k.string().optional(),
  capacity: k.number().optional()
});

export const unifiedCreatePostSchema = k.union([
  articleSchema,
  photoSchema,
  gallerySchema,
  thoughtSchema,
  musicSchema,
  videoSchema,
  projectSchema,
  linkSchema,
  announcementSchema,
  eventSchema
]);

export type UnifiedCreatePost = kataxInfer<typeof unifiedCreatePostSchema>;

// Schema para update: todos los campos son opcionales
export const unifiedUpdatePostSchema = k.union([
  articleSchema.partial(),
  photoSchema.partial(),
  gallerySchema.partial(),
  thoughtSchema.partial(),
  musicSchema.partial(),
  videoSchema.partial(),
  projectSchema.partial(),
  linkSchema.partial(),
  announcementSchema.partial(),
  eventSchema.partial()
]);

export type UnifiedUpdatePost = kataxInfer<typeof unifiedUpdatePostSchema>;

// ------------------ Validators ------------------
export async function validatePostsQuery(data: unknown): Promise<ValidationResult<PostsQuery>> {
  const result: ReturnType<typeof postsQuerySchema.safeParse> = postsQuerySchema.safeParse(data);
  if (!result.success) {
    const errors = result.issues.map(i => ({ field: i.path.join('.'), message: i.message }));
    return { isValid: false, errors };
  }
  return { isValid: true, data: result.data };
}

export async function validateCreatePostBody(data: unknown): Promise<ValidationResult<UnifiedCreatePost>> {
  // Validate against the unified schema supporting multiple post types
  const result: ReturnType<typeof unifiedCreatePostSchema.safeParse> = unifiedCreatePostSchema.safeParse(data);
  if (!result.success) {
    const errors = result.issues.map(i => ({ field: i.path.join('.'), message: i.message }));
    return { isValid: false, errors };
  }
  return { isValid: true, data: result.data };
}

export async function validateUpdatePostBody(data: unknown): Promise<ValidationResult<UnifiedUpdatePost>> {
  const result: ReturnType<typeof unifiedUpdatePostSchema.safeParse> = unifiedUpdatePostSchema.safeParse(data);
  if (!result.success) {
    const errors = result.issues.map(i => ({ field: i.path.join('.'), message: i.message }));
    return { isValid: false, errors };
  }
  return { isValid: true, data: result.data };
}

export async function validateIdParam(data: unknown): Promise<ValidationResult<{ id: string }>> {
  const schema = k.object({ id: k.string().minLength(1) });
  const result = schema.safeParse(data);
  if (!result.success) {
    const errors = result.issues.map(i => ({ field: i.path.join('.'), message: i.message }));
    return { isValid: false, errors };
  }
  return { isValid: true, data: result.data };
}
