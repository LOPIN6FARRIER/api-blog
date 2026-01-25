# Optimización de Imágenes - API Blog

## Instalación de Sharp

Para habilitar la optimización automática de imágenes, debes instalar `sharp`:

```bash
cd d:\Proyectos 2025\api-blog
npm install sharp
```

## ¿Qué hace?

1. **Redimensiona** imágenes grandes a máximo 1920x1080px
2. **Convierte** a formato WebP (más eficiente que JPEG/PNG)
3. **Comprime** con calidad 85% (balance perfecto)
4. **Elimina** el archivo original para ahorrar espacio

## Configuración

Puedes personalizar la optimización en `posts.routes.ts`:

```typescript
// Imagen única
router.post("/:id/image", 
  upload.single("image"), 
  optimizeImage({ 
    maxWidth: 1920, 
    maxHeight: 1080, 
    quality: 85,
    format: 'webp' 
  }), 
  uploadPostImageHandler
);

// Múltiples imágenes
router.post("/:id/images", 
  upload.array("images"), 
  optimizeImages({ 
    maxWidth: 1200,  // Más pequeñas para galerías
    quality: 80 
  }), 
  uploadPostImagesHandler
);
```

## Beneficios

- 🚀 **70-90% menos peso** en imágenes
- ⚡ **Carga 3-5x más rápida**
- 💾 **Ahorro de almacenamiento**
- 🌐 **Mejor SEO** (velocidad de carga)

## Desactivar temporalmente

Si quieres desactivar la optimización, simplemente comenta los middlewares en `posts.routes.ts`:

```typescript
router.post("/:id/image", 
  upload.single("image"), 
  // optimizeImage(),  // <-- Comentar esta línea
  uploadPostImageHandler
);
```
