// Extensión de tipos para Multer
declare namespace Express {
  namespace Multer {
    interface File {
      thumbnails?: {
        small: string;
        medium: string;
        large: string;
      };
    }
  }
}

export {};
