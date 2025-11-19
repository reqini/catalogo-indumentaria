# Crear Iconos PWA Válidos

## Problema
Los iconos PWA (`icon-192x192.png` y `icon-512x512.png`) son placeholders de 1x1 píxeles, causando errores en el manifest.

## Soluciones

### Opción 1: Usar Script con Canvas (Recomendado)

```bash
# Instalar canvas
pnpm add -D canvas

# Generar iconos
pnpm run create-pwa-icons
```

### Opción 2: Usar Servicio Online (Más Rápido)

1. Ve a [RealFaviconGenerator](https://realfavicongenerator.net/)
2. Sube una imagen cuadrada (mínimo 512x512)
3. Configura:
   - **Android Chrome**: 192x192 y 512x512
   - **iOS**: 180x180
   - **Favicon**: 32x32
4. Descarga el paquete generado
5. Copia `android-chrome-192x192.png` → `public/icon-192x192.png`
6. Copia `android-chrome-512x512.png` → `public/icon-512x512.png`

### Opción 3: Crear Manualmente con Herramientas

**Con ImageMagick** (si está instalado):
```bash
# Crear icono 192x192
convert -size 192x192 xc:black -fill white -draw "circle 96,96 96,26" -fill black -pointsize 60 -gravity center -annotate +0+0 "CI" public/icon-192x192.png

# Crear icono 512x512
convert -size 512x512 xc:black -fill white -draw "circle 256,256 256,76" -fill black -pointsize 160 -gravity center -annotate +0+0 "CI" public/icon-512x512.png
```

**Con GIMP/Photoshop**:
1. Crear imagen cuadrada (192x192 o 512x512)
2. Fondo negro (#000000)
3. Círculo blanco centrado
4. Texto "CI" en negro, centrado
5. Exportar como PNG

### Opción 4: Usar Iconos de Ejemplo

Si necesitas iconos rápidamente para testing, puedes usar estos servicios:
- [Favicon.io](https://favicon.io/) - Genera desde texto
- [IconGenerator](https://icon-generator.net/) - Genera desde imagen
- [PWA Asset Generator](https://github.com/onderceylan/pwa-asset-generator) - CLI tool

## Verificación

Después de crear los iconos, verifica:

```bash
# Verificar dimensiones
file public/icon-192x192.png
file public/icon-512x512.png

# Debe mostrar:
# PNG image data, 192 x 192
# PNG image data, 512 x 512
```

## Validación PWA

1. Abre la app en Chrome
2. Abre DevTools > Lighthouse
3. Ejecuta auditoría PWA
4. Verifica que no haya errores de iconos

## Notas

- Los iconos deben ser PNG válidos
- Dimensiones exactas: 192x192 y 512x512
- Formato: PNG con transparencia opcional
- Tamaño recomendado: < 100KB cada uno

