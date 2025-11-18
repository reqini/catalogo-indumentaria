# Guía de Instalación Rápida

## Pasos para ejecutar el proyecto

1. **Instalar dependencias**
```bash
npm install
```

2. **Configurar variables de entorno**
Crea un archivo `.env.local` en la raíz del proyecto con:
```
NEXT_PUBLIC_ADMIN_USERNAME=admin
NEXT_PUBLIC_ADMIN_PASSWORD=admin123
NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY=tu_public_key
MERCADOPAGO_ACCESS_TOKEN=tu_access_token
```

3. **Ejecutar en desarrollo**
```bash
npm run dev
```

4. **Abrir en el navegador**
```
http://localhost:3000
```

## Acceso al Panel de Administración

- URL: `http://localhost:3000/admin`
- Usuario: `admin` (o el configurado en `.env.local`)
- Contraseña: `admin123` (o la configurada en `.env.local`)

## Notas Importantes

- Los datos se almacenan en memoria por defecto (para desarrollo)
- Para producción, conectar a una base de datos real
- Las imágenes deben estar en `/public/products/` o usar Cloudinary
- Los banners deben estar en `/public/` como `banner-1.jpg`, `banner-2.jpg`, etc.

## Estructura de Carpetas de Imágenes

```
/public
  ├─ products/
  │  ├─ remera-1.jpg
  │  ├─ remera-1-2.jpg
  │  ├─ pantalon-1.jpg
  │  └─ buzo-1.jpg
  ├─ banner-1.jpg
  ├─ banner-2.jpg
  ├─ icon-192x192.png
  └─ icon-512x512.png
```

## Comandos Disponibles

- `npm run dev` - Desarrollo
- `npm run build` - Build de producción
- `npm run start` - Servidor de producción
- `npm run lint` - Linter



