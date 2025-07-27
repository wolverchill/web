# Imágenes del Blog

Esta carpeta contiene las imágenes subidas para los posts del blog.

## Cómo funciona

1. **Subida de imágenes**: Cuando creas un nuevo post en el AdminBlog, puedes subir una imagen usando el botón "Subir imagen".

2. **Almacenamiento**: Las imágenes se guardan en esta carpeta con nombres únicos que incluyen timestamp.

3. **Formato de archivos**: Se aceptan los siguientes formatos:
   - PNG
   - JPG/JPEG
   - GIF
   - WebP

4. **Tamaño recomendado**: Para mejor rendimiento, se recomienda:
   - Ancho: 800-1200px
   - Alto: 600-800px
   - Formato: JPG o WebP
   - Tamaño de archivo: < 2MB

## Estructura de archivos

Los archivos se guardan con el formato: `nombre_original_timestamp.extension`

Ejemplo: `mi_imagen_1703123456.jpg`

## Uso en el código

Las imágenes se referencian en el código como:
```javascript
// En el frontend
const imageUrl = "/src/assets/images/blog/mi_imagen_1703123456.jpg"
```

## Notas importantes

- Las imágenes se guardan localmente en el proyecto
- Para producción, considera usar un servicio de CDN
- Las imágenes se incluyen en el build del proyecto
- Mantén un tamaño de archivo razonable para mejor rendimiento 