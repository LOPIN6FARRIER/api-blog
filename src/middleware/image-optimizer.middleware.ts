import path from "path";
import fs from "fs/promises";
import type { Request, Response, NextFunction } from "express";

// Sharp será importado dinámicamente para evitar errores si no está instalado
let sharp: any = null;

interface OptimizeOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  format?: "jpeg" | "png" | "webp";
  generateThumbnails?: boolean; // Generar thumbnails
}

const defaultOptions: OptimizeOptions = {
  maxWidth: 1920,
  maxHeight: 1080,
  quality: 85,
  format: "webp", // WebP es más eficiente que JPEG/PNG
  generateThumbnails: true,
};

// Tamaños de thumbnails
const THUMBNAIL_SIZES = [
  { name: "small", width: 150, height: 150 },
  { name: "medium", width: 400, height: 400 },
  { name: "large", width: 800, height: 800 },
];

/**
 * Middleware para optimizar imágenes después de que multer las sube
 * Debe usarse DESPUÉS del middleware de multer
 */
export function optimizeImage(options: OptimizeOptions = {}) {
  const opts = { ...defaultOptions, ...options };

  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      // Intentar importar sharp dinámicamente
      if (!sharp) {
        try {
          sharp = (await import("sharp")).default;
        } catch (e) {
          console.warn(
            "[image-optimizer] Sharp no disponible, saltando optimización",
          );
          return next();
        }
      }

      const file = (req as any).file as Express.Multer.File | undefined;

      if (!file) {
        return next();
      }

      const originalPath = file.path;
      const ext = path.extname(file.originalname).toLowerCase();

      // Solo procesar imágenes
      if (![".jpg", ".jpeg", ".png", ".webp"].includes(ext)) {
        return next();
      }

      console.log(`[image-optimizer] Optimizing: ${file.filename}`);

      // Crear nombre optimizado
      const optimizedFilename = file.filename.replace(
        /\.[^.]+$/,
        `.${opts.format}`,
      );
      const optimizedPath = path.join(
        path.dirname(originalPath),
        optimizedFilename,
      );

      // Optimizar imagen principal
      await sharp(originalPath)
        .resize(opts.maxWidth, opts.maxHeight, {
          fit: "inside",
          withoutEnlargement: true,
        })
        .toFormat(opts.format!, { quality: opts.quality })
        .toFile(optimizedPath);

      // Generar thumbnails si está habilitado
      const thumbnails: any = {};
      if (opts.generateThumbnails) {
        for (const size of THUMBNAIL_SIZES) {
          const thumbFilename = file.filename.replace(
            /\.[^.]+$/,
            `-${size.name}.${opts.format}`,
          );
          const thumbPath = path.join(
            path.dirname(originalPath),
            thumbFilename,
          );

          await sharp(originalPath)
            .resize(size.width, size.height, {
              fit: "cover",
              position: "center",
            })
            .toFormat(opts.format!, { quality: 75 }) // Menor calidad para thumbnails
            .toFile(thumbPath);

          thumbnails[size.name] = thumbFilename;
        }
        console.log(
          `[image-optimizer] Generated ${Object.keys(thumbnails).length} thumbnails`,
        );
      }

      // Eliminar archivo original
      await fs.unlink(originalPath);

      // Actualizar req.file con la nueva info + thumbnails
      (req as any).file = {
        ...file,
        filename: optimizedFilename,
        path: optimizedPath,
        mimetype: `image/${opts.format}`,
        thumbnails, // Agregar info de thumbnails
      };

      console.log(`[image-optimizer] Optimized: ${optimizedFilename}`);
      next();
    } catch (error) {
      console.error("[image-optimizer] Error:", error);
      next(error);
    }
  };
}

/**
 * Optimizar múltiples imágenes (para upload.array)
 */
export function optimizeImages(options: OptimizeOptions = {}) {
  const opts = { ...defaultOptions, ...options };

  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      // Intentar importar sharp dinámicamente
      if (!sharp) {
        try {
          sharp = (await import("sharp")).default;
        } catch (e) {
          console.warn(
            "[image-optimizer] Sharp no disponible, saltando optimización",
          );
          return next();
        }
      }

      const files = (req as any).files as Express.Multer.File[] | undefined;

      if (!files || files.length === 0) {
        return next();
      }

      console.log(`[image-optimizer] Optimizing ${files.length} images...`);

      const optimizedFiles = await Promise.all(
        files.map(async (file) => {
          const originalPath = file.path;
          const ext = path.extname(file.originalname).toLowerCase();

          // Solo procesar imágenes
          if (![".jpg", ".jpeg", ".png", ".webp"].includes(ext)) {
            return file;
          }

          const optimizedFilename = file.filename.replace(
            /\.[^.]+$/,
            `.${opts.format}`,
          );
          const optimizedPath = path.join(
            path.dirname(originalPath),
            optimizedFilename,
          );

          await sharp(originalPath)
            .resize(opts.maxWidth, opts.maxHeight, {
              fit: "inside",
              withoutEnlargement: true,
            })
            .toFormat(opts.format!, { quality: opts.quality })
            .toFile(optimizedPath);

          // Generar thumbnails
          const thumbnails: any = {};
          if (opts.generateThumbnails) {
            for (const size of THUMBNAIL_SIZES) {
              const thumbFilename = file.filename.replace(
                /\.[^.]+$/,
                `-${size.name}.${opts.format}`,
              );
              const thumbPath = path.join(
                path.dirname(originalPath),
                thumbFilename,
              );

              await sharp(originalPath)
                .resize(size.width, size.height, {
                  fit: "cover",
                  position: "center",
                })
                .toFormat(opts.format!, { quality: 75 })
                .toFile(thumbPath);

              thumbnails[size.name] = thumbFilename;
            }
          }

          // Eliminar archivo original
          await fs.unlink(originalPath);

          return {
            ...file,
            filename: optimizedFilename,
            path: optimizedPath,
            mimetype: `image/${opts.format}`,
            thumbnails,
          };
        }),
      );

      (req as any).files = optimizedFiles;
      console.log(
        `[image-optimizer] Optimized ${optimizedFiles.length} images`,
      );
      next();
    } catch (error) {
      console.error("[image-optimizer] Error:", error);
      next(error);
    }
  };
}
