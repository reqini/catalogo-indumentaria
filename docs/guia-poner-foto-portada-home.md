# 📸 Guía: Poner Foto en Portada de la Home

## 🎯 Objetivo

Configurar una imagen personalizada como banner principal en la página de inicio (Home).

## 📋 Pasos

### Opción 1: Desde el Admin Panel (Recomendado)

1. **Acceder al Admin:**
   - Ve a: `http://localhost:3001/admin`
   - Inicia sesión con tus credenciales

2. **Ir a Banners:**
   - En el menú lateral, click en "Banners"
   - O ve directamente a: `http://localhost:3001/admin/banners`

3. **Crear Nuevo Banner:**
   - Click en el botón "Nuevo Banner" (+)
   - Completa el formulario:
     - **Título**: Ej: "Nueva Colección 2024"
     - **Imagen URL**: 
       - Puedes usar una URL de imagen (ej: Unsplash, Cloudinary, etc.)
       - O subir una imagen y usar su URL
     - **Link**: URL a donde redirige (ej: `/catalogo`)
     - **Activo**: ✅ Marcar como activo
     - **Orden**: 1 (para que sea el primero)

4. **Guardar:**
   - Click en "Guardar"
   - El banner aparecerá en la home automáticamente

### Opción 2: Usar Imagen Genérica (Automático)

Si no hay banners activos, la home usa automáticamente una imagen genérica de indumentaria de Unsplash.

## 🖼️ Formatos de Imagen Recomendados

- **Formato**: JPG, PNG, WebP
- **Tamaño recomendado**: 1920x1080px (Full HD) o mayor
- **Peso**: Máximo 2MB (optimizado)
- **Aspecto**: 16:9 o similar

## 📝 Ejemplos de URLs de Imagen

### Unsplash (Gratis, sin registro):
```
https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1920&q=80
```

### Cloudinary (Si tienes cuenta):
```
https://res.cloudinary.com/tu-cloud/image/upload/v1234567/banner.jpg
```

### Imagen Local (Si está en /public):
```
/images/banner-principal.jpg
```

## 🔧 Configuración Técnica

### Cómo Funciona

1. El componente `HeroBanner` en `app/page.tsx` busca banners activos
2. Usa el primer banner activo como imagen principal
3. Si no hay banners, usa imagen genérica de Unsplash
4. La imagen se carga con `next/image` para optimización automática

### Código Relevante

```typescript
// app/page.tsx - HeroBanner component
const banners = await getBanners()
if (banners.length > 0 && banners[0].imagenUrl) {
  setHeroImage(banners[0].imagenUrl)
}
```

## ✅ Verificación

Después de crear el banner:

1. Ve a la home: `http://localhost:3001/`
2. Verifica que la imagen se muestre correctamente
3. Verifica que el texto y botones sean legibles sobre la imagen

## 🐛 Troubleshooting

### La imagen no se muestra
- Verifica que el banner esté marcado como "Activo"
- Verifica que la URL de la imagen sea accesible
- Revisa la consola del navegador para errores

### La imagen se ve distorsionada
- Usa una imagen con aspecto 16:9
- Asegúrate de que la imagen tenga buena resolución (mínimo 1920px de ancho)

### La imagen carga muy lento
- Optimiza la imagen antes de subirla
- Usa formatos modernos (WebP)
- Considera usar un CDN como Cloudinary

## 📚 Recursos Adicionales

- [Documentación de Next.js Image](https://nextjs.org/docs/pages/api-reference/components/image)
- [Unsplash - Imágenes gratis](https://unsplash.com)
- [Cloudinary - CDN de imágenes](https://cloudinary.com)

