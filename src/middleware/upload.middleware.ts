import multer from 'multer';
import path from 'path';
import fs from 'fs';
import type { Request } from 'express';

// Determine images directory based on NODE_ENV
const isDev = process.env.NODE_ENV === 'dev' || process.env.NODE_ENV === 'development';
const defaultDevDir = path.join(process.cwd(), 'images'); // ./images relative to project root
const defaultProdDir = '/var/www/vinicio_blog/images';
const imagesDir = isDev
  ? (process.env.DEV_IMAGES_DIR || defaultDevDir)
  : (process.env.IMAGES_DIR || defaultProdDir);

// Ensure directory exists (create recursively if not)
try {
  if (!fs.existsSync(imagesDir)) {
    fs.mkdirSync(imagesDir, { recursive: true });
    console.log(`[upload.middleware] Created images directory: ${imagesDir}`);
  } else {
    console.log(`[upload.middleware] Using images directory: ${imagesDir}`);
  }
} catch (err) {
  console.error(`[upload.middleware] Failed to create images directory: ${imagesDir}`, err);
}

const storage = multer.diskStorage({
  destination: function (_req: Request, _file: Express.Multer.File, cb: (error: Error | null, destination: string) => void) {
    cb(null, path.resolve(imagesDir));
  },
  filename: function (_req: Request, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void) {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const safe = file.originalname.replace(/[^a-zA-Z0-9.\-_]/g, '_');
    cb(null, `${unique}-${safe}`);
  }
});

function fileFilter(_req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) {
  if (!file.mimetype.startsWith('image/')) {
    return cb(new Error('Only image files are allowed'));
  }
  cb(null, true);
}

const upload = multer({ storage, fileFilter, limits: { fileSize: 10 * 1024 * 1024 } });

export default upload;
export { imagesDir };
